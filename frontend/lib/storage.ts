// frontend/lib/storage.ts
"use server";

import { Signer } from "@storacha/client/principal/ed25519";
import { StoreMemory } from "@storacha/client/stores";
import { create } from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import { File } from "@web-std/file";

export interface ReviewData {
  reviewer: string;
  text: string;
  rating: number;
  imageUrls?: string[];
  imageFilenames?: string[];
}

export interface ReviewUpload {
  placeId: string | undefined;
  text: string | undefined;
  rating: number | undefined;
  tags?: string[];
  imageFilenames?: string[];
}

export async function uploadReviewToIPFS(
  review: ReviewUpload,
  imageFiles: File[]
) {
  const principal = Signer.parse(process.env.STORACHA_KEY ?? "");
  const store = new StoreMemory();
  const client = await create({ principal, store });
  const proof = await Proof.parse(process.env.STORACHA_PROOF ?? "");
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  const reviewDataToUpload: ReviewUpload = { ...review };
  const filesToUpload: File[] = [];

  if (imageFiles.length > 0) {
    const imageFilenames = imageFiles.map((file) => file.name);
    reviewDataToUpload.imageFilenames = imageFilenames; // Store the array of names

    // Add image files to the upload list
    for (const imageFile of imageFiles) {
      filesToUpload.push(
        new File([await imageFile.arrayBuffer()], imageFile.name, {
          type: imageFile.type,
        })
      );
    }
  }
  const reviewBlob = new Blob([JSON.stringify(reviewDataToUpload)], {
    type: "application/json",
  });
  filesToUpload.unshift(new File([reviewBlob], "review.json")); // Add review.json at the beginning

  // Upload directory (will contain only review.json if no images)
  const cid = await client.uploadDirectory(filesToUpload);
  const strCid = JSON.parse(JSON.stringify(cid))["/"].toString();
  return strCid;
}

export async function getReviewDataByCID(cid: string, maxRetries = 3) {
  const gateways = [
    `https://${cid}.ipfs.w3s.link/review.json`,
    `https://${cid}.ipfs.storacha.link/review.json`,
  ];
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of gateways) {
      try {
        console.log(`Attempt ${attempt + 1}: Fetching review from ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const review: ReviewData = await res.json();
        return review;
      } catch (err) {
        console.warn(`Failed to fetch from ${url}`, err);
        await new Promise((r) => setTimeout(r, 500)); // wait 500 ms before retrying
      }
    }
  }
  console.error(`All attempts failed for CID ${cid}`);
  const empty: ReviewData = {
    reviewer: "Unknown reviewer",
    text: "Unknown review",
    rating: 0,
    imageUrls: [],
  };
  return empty;
}
