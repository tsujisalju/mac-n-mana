import { readContract, writeContract } from "wagmi/actions";
import { reviewRegistryConfig } from "./contracts/reviewRegistry";
import { config } from "./wagmi";

export async function submitReview(
  placeId: string,
  ipfsHash: string,
  rating: number,
) {
  return await writeContract(config, {
    ...reviewRegistryConfig,
    functionName: "submitReview",
    args: [placeId, ipfsHash, rating],
  });
}

export async function voteReview(reviewId: number, vote: 1 | -1) {
  return await writeContract(config, {
    ...reviewRegistryConfig,
    functionName: "voteReview",
    args: [reviewId, vote],
  });
}

export async function getReviewScore(reviewId: number) {
  const score = await readContract(config, {
    ...reviewRegistryConfig,
    functionName: "getScore",
    args: [reviewId],
  });
  return score as bigint;
}

export async function getUserReputation(address: string) {
  const userReputation = await readContract(config, {
    ...reviewRegistryConfig,
    functionName: "getUserReputation",
    args: [address],
  });
  return userReputation as bigint;
}

export async function submitReply(
  reviewId: number,
  ipfsHash: string,
  parentReplyId: number,
) {
  return await writeContract(config, {
    ...reviewRegistryConfig,
    functionName: "addReply",
    args: [reviewId, ipfsHash, parentReplyId],
  });
}

export async function getReplyCount(reviewId: number) {
  const replyCount = await readContract(config, {
    ...reviewRegistryConfig,
    functionName: "getReplyCount",
    args: [reviewId],
  });
  return replyCount as number;
}
