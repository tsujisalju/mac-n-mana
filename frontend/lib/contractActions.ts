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

export async function getReview(reviewId: number) {
  const review = await readContract(config, {
    ...reviewRegistryConfig,
    functionName: "getReview",
    args: [reviewId],
  });
  return review as {
    reviewer: string;
    placeId: string;
    ipfsHash: string;
    rating: number;
    timestamp: bigint;
    reputationScore: bigint;
  };
}

export async function getReviewCount(){
  const count = await readContract(config, {
    ...reviewRegistryConfig,
    functionName: "reviewCount",
    args:[],
  });
  return count as bigint;
  }

  export async function getUserReviews(userAddress: string) {
    try{
      const totalReviews = await getReviewCount();
      const userReviews = [];
    
      for (let i = 0; i < Number(totalReviews); i++) {
        try{
          const review = await getReview(i);
          if (review.reviewer.toLowerCase() === userAddress.toLowerCase()) {
            userReviews.push({reviewId: i, ...review});

          }
        } catch (error) {
          console.error(`Error fetching review with ID ${i}:`, error);
        }
      }
      return userReviews;
    } catch (error) {
      console.error(`Error fetching user reviews for address ${userAddress}:`, error);
      return [];
    }
  }

