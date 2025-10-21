"use server";

import { Signer } from "@storacha/client/principal/ed25519";
import { StoreMemory } from "@storacha/client/stores";
import { create } from "@storacha/client";
import * as Proof from "@storacha/client/proof";

export interface ReviewUpload {
  placeId: string;
  text: string;
  rating: number;
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
  const res = await fetch("https://" + cid + ".ipfs.storacha.link/review.json");
  const review: ReviewUpload = await res.json();
  return review;
}
