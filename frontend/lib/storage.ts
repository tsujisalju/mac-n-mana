// frontend/lib/storage.ts
"use server";

import { Signer } from "@storacha/client/principal/ed25519";
import { StoreMemory } from "@storacha/client/stores";
import { create } from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import { File } from '@web-std/file';

export interface ReviewData {
  reviewer: string;
  text: string;
  rating: number;
}

export interface ReviewUpload {
  placeId: string | undefined;
  text: string | undefined;
  rating: number | undefined;
  tags?: string[];
  imageFilenames?: string[]; // --- Changed to array ---
}

// --- Accept array of files ---
export async function uploadReviewToIPFS(review: ReviewUpload, imageFiles: File[]) {
  const principal = Signer.parse(process.env.STORACHA_KEY ?? "");
  const store = new StoreMemory();
  const client = await create({ principal, store });
  const proof = await Proof.parse(process.env.STORACHA_PROOF ?? "");
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  let reviewDataToUpload: ReviewUpload = { ...review };
  const filesToUpload: File[] = [];

  // --- Handle filenames array ---
  if (imageFiles.length > 0) {
      const imageFilenames = imageFiles.map(file => file.name);
      reviewDataToUpload.imageFilenames = imageFilenames; // Store the array of names

      // Add image files to the upload list
      for (const imageFile of imageFiles) {
          filesToUpload.push(new File([await imageFile.arrayBuffer()], imageFile.name, { type: imageFile.type }));
      }
  }
  // --- End of change ---

  // Always add review.json
  const reviewBlob = new Blob([JSON.stringify(reviewDataToUpload)], {
    type: "application/json",
  });
  filesToUpload.unshift(new File([reviewBlob], "review.json")); // Add review.json at the beginning

  // Upload directory (will contain only review.json if no images)
  const cid = await client.uploadDirectory(filesToUpload);
  const strCid = JSON.parse(JSON.stringify(cid))["/"].toString();
  return strCid;
}

// getReviewByCID remains mostly the same, but the returned object now might have imageFilenames[]
export async function getReviewByCID(cid: string, maxRetries: number = 3): Promise<ReviewUpload | null> {
  const reviewJsonUrl = `https://${cid}.ipfs.storacha.link/review.json`;
  let attempt = 0;
  let timeoutId: NodeJS.Timeout | undefined; // Declare timeoutId here

  while (attempt < maxRetries) {
    attempt++;
    console.log(`Attempt ${attempt}/${maxRetries} to fetch review data for CID: ${cid}`);
    try {
      const controller = new AbortController();
      // Assign the timeout ID using the declared variable
      timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

      const res = await fetch(reviewJsonUrl, { signal: controller.signal });
      clearTimeout(timeoutId); // Clear timeout

      if (res.ok) {
        const review: ReviewUpload = await res.json();
        console.log(`Successfully fetched review data for CID: ${cid} on attempt ${attempt}`);
        return review;
      } else {
        console.error(`Attempt ${attempt} failed: Status ${res.status} ${res.statusText} for ${reviewJsonUrl}`);
        if ((res.status === 504 || res.status >= 500) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return null;
      }
    } catch (error: any) {
      // --- Clear timeout in catch block ---
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // --- End of change ---
       console.error(`Attempt ${attempt} failed with error for CID ${cid}:`, error.name === 'AbortError' ? 'Timeout' : error);
       if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
       } else {
           return null;
       }
    } finally {
        // Ensure timeout is always cleared if it was set
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
  }

  console.error(`Failed to fetch review data for CID: ${cid} after ${maxRetries} attempts.`);
  return null;
}
