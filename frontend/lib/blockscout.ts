// frontend/lib/blockscout.ts
import { reviewRegistryConfig } from "./contracts/reviewRegistry";
// Use the updated ReviewUpload type from storage.ts
import { ReviewUpload, ReviewData, getReviewByCID } from "./storage";

export function getImageUrlFromReviewCID(cid: string, imageName: string | undefined): string | null {
    if (!imageName) return null;
    return `https://${cid}.ipfs.storacha.link/${encodeURIComponent(imageName)}`;
}

export interface Review {
  reviewer: string;
  text: string;
  rating: number;
  imageUrls?: string[];
}

// Interfaces (EventLogs, Item, Address, Decoded, Parameter, SmartContract) remain the same
// but adjusted some types to allow null based on previous changes
export interface EventLogs {
    items: Item[];
    next_page_params: unknown;
}

export interface Item {
    address: Address;
    block_hash: string;
    block_number: number;
    data: string;
    decoded: Decoded | null; // Allow null
    index: number;
    smart_contract: SmartContract | null; // Allow null
    topics: string[] | undefined[]; // Adjusted type
    transaction_hash: string;
}

export interface Address {
    ens_domain_name: string | null;
    hash: string;
    implementations: unknown[];
    is_contract: boolean;
    is_scam: boolean | null;
    is_verified: boolean | null;
    metadata: unknown;
    name: string | null;
    private_tags: unknown[];
    proxy_type: unknown;
    public_tags: unknown[];
    reputation: string | null;
    watchlist_names: unknown[];
}

export interface Decoded {
    method_call: string | null;
    method_id: string | null;
    parameters: Parameter[];
}

export interface Parameter {
    indexed: boolean;
    name: string;
    type: string;
    value: string | any; // More flexible type
}

export interface SmartContract {
    ens_domain_name: string | null;
    hash: string;
    implementations: unknown[];
    is_contract: boolean;
    is_scam: boolean | null;
    is_verified: boolean | null;
    metadata: unknown;
    name: string | null;
    private_tags: unknown[];
    proxy_type: unknown;
    public_tags: unknown[];
    reputation: string | null;
    watchlist_names: unknown[];
}


export async function fetchReviewsByPlaceId(placeId: string): Promise<ReviewData[]> { // Explicit return type
  const res = await fetch(
    `https://eth-sepolia.blockscout.com/api/v2/addresses/${reviewRegistryConfig.address}/logs`,
  );
   if (!res.ok) {
      console.error("Failed to fetch logs from Blockscout:", res.status, res.statusText);
      return [];
  }
  const data: EventLogs = await res.json();

  const placeData = data.items.filter((event) => {
    // Ensure decoded exists and parameters array exists
    if (!event.decoded || !Array.isArray(event.decoded.parameters)) {
        return false;
    }
    // Check for ReviewSubmitted event and matching placeId
    return event.decoded.parameters.some(
      (p) => p.name === "placeId" && p.value === placeId
    ) && event.decoded.parameters.some(p => p.name === "ipfsHash");
  });

  // Use Promise.allSettled to handle potential errors in fetching individual reviews
  const results = await Promise.allSettled(
    placeData.map(async (event): Promise<Review | null> => { // Return Promise<Review | null>
      if (!event.decoded) return null; // Should be filtered already, but safe check

      const params = event.decoded.parameters;
      const ipfsParam = params.find((p) => p.name === "ipfsHash");
      const reviewerParam = params.find((p) => p.name === "reviewer");

      const cid = ipfsParam?.value as string | undefined;

      if (!cid) {
        console.warn("No ipfsHash found for an event");
        return null;
      }

      const reviewData = await getReviewByCID(cid);

      if (!reviewData) {
        console.warn(`Failed to get review data for CID: ${cid}`);
        return null;
      }

      let imageUrls: string[] = []; // Default to empty array
      if (reviewData.imageFilenames && Array.isArray(reviewData.imageFilenames)) {
          imageUrls = reviewData.imageFilenames
              .map(filename => getImageUrlFromReviewCID(cid, filename)) // Map filenames to URLs
              .filter((url): url is string => url !== null); // Filter out any null results
      }

      return {
        reviewer: reviewerParam?.value ?? "Unknown reviewer",
        text: reviewData.text ?? "No text provided", // Use default if text is missing
        rating: reviewData.rating ?? 0,          // Use default if rating is missing
        imageUrls: imageUrls,
      };
    }),
  );

  // Filter out failed promises and null results
  const reviews: ReviewData[] = results
      .filter((result): result is PromiseFulfilledResult<Review | null> => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value as Review); // Type assertion is safe here due to filter

  return reviews;
}