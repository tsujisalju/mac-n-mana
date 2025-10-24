// frontend/lib/blockscout.ts
import { reviewRegistryConfig } from "./contracts/reviewRegistry";

export function getImageUrlFromReviewCID(
  cid: string,
  imageName: string | undefined,
): string | null {
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
  value: string;
}

export interface ReviewParams {
  reviewId: string;
  reviewer: string;
  placeId: string;
  ipfsHash: string;
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

export async function fetchReviewParamsByPlaceId(
  placeId: string,
): Promise<ReviewParams[]> {
  const res = await fetch(
    `https://eth-sepolia.blockscout.com/api/v2/addresses/${reviewRegistryConfig.address}/logs`,
  );
  if (!res.ok) {
    console.error(
      "Failed to fetch logs from Blockscout:",
      res.status,
      res.statusText,
    );
    return [];
  }
  const data: EventLogs = await res.json();

  const placeData = data.items.filter((event) => {
    // Ensure decoded exists and parameters array exists
    if (!event.decoded || !Array.isArray(event.decoded.parameters)) {
      return false;
    }
    // Check for ReviewSubmitted event and matching placeId
    return (
      event.decoded.parameters.some(
        (p) => p.name === "placeId" && p.value === placeId,
      ) && event.decoded.parameters.some((p) => p.name === "ipfsHash")
    );
  });

  const reviewParamsList: ReviewParams[] = placeData
    .map((event) => {
      if (!event.decoded) return null; // Should be filtered already, but safe check
      const params = event.decoded.parameters;
      const reviewParams: ReviewParams = {
        reviewId: params.find((p) => p.name === "reviewId")?.value ?? "",
        reviewer: params.find((p) => p.name === "reviewer")?.value ?? "",
        placeId: params.find((p) => p.name === "placeId")?.value ?? "",
        ipfsHash: params.find((p) => p.name === "ipfsHash")?.value ?? "",
      };
      return reviewParams;
    })
    .filter((params) => params != null);
  return reviewParamsList;
}
