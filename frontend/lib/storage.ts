import { create } from "@storacha/client";

export interface Review {
  placeId: string;
  text: string;
  rating: number;
  tags?: string[];
}

export async function uploadReviewToIPFS(review: Review) {
  const client = await create();
  await client.login("purrnama@proton.me");
  client.setCurrentSpace(
    "did:key:z6MkthzSovR8bGvcDwMsdUEHLwYL52ZYyDRirnczRzWaMV6J",
  );
  const blob = new Blob([JSON.stringify(review)], { type: "application/json" });
  const files = [new File([blob], "reviews/review.json")];
  const directoryCid = await client.uploadDirectory(files);
  return directoryCid;
}
