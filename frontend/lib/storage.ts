"use server";

import { Signer } from "@storacha/client/principal/ed25519";
import { StoreMemory } from "@storacha/client/stores";
import { create } from "@storacha/client";
import * as Proof from "@storacha/client/proof";

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
}

export async function uploadReviewToIPFS(review: ReviewUpload) {
  const principal = Signer.parse(process.env.STORACHA_KEY ?? "");
  const store = new StoreMemory();
  const client = await create({ principal, store });
  const proof = await Proof.parse(process.env.STORACHA_PROOF ?? "");
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());
  const blob = new Blob([JSON.stringify(review)], {
    type: "application/json",
  });
  const files = [new File([blob], "review.json")];
  const cid = await client.uploadDirectory(files);
  const strCid = JSON.parse(JSON.stringify(cid))["/"].toString();
  return strCid;
}

export async function getReviewByCID(cid: string) {
  try {
    const url = "https://" + cid + ".ipfs.w3s.link/review.json";
    console.log("Retrieving review via", url);
    const res = await fetch(url);
    const review: ReviewUpload = await res.json();
    return review;
  } catch (err) {
    console.error("Error when fetching review " + cid, err);
    const empty: ReviewUpload = {
      placeId: undefined,
      text: undefined,
      rating: 0,
    };
    return empty;
  }
}
