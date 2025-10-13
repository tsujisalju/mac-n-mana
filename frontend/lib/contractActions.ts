import { writeContract } from "wagmi/actions";
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
