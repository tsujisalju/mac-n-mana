import { reviewRegistryConfig } from "./contracts/reviewRegistry";
import { getReviewByCID, ReviewData } from "./storage";

export interface EventLogs {
  items: Item[];
  next_page_params: unknown;
}

export interface Item {
  address: Address;
  block_hash: string;
  block_number: number;
  data: string;
  decoded: Decoded;
  index: number;
  smart_contract: SmartContract;
  topics: string | undefined[];
  transaction_hash: string;
}

export interface Address {
  ens_domain_name: string;
  hash: string;
  implementations: unknown[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: unknown;
  name: string;
  private_tags: unknown[];
  proxy_type: unknown;
  public_tags: unknown[];
  reputation: string;
  watchlist_names: unknown[];
}

export interface Decoded {
  method_call: string;
  method_id: string;
  parameters: Parameter[];
}

export interface Parameter {
  indexed: boolean;
  name: string;
  type: string;
  value: string;
}

export interface SmartContract {
  ens_domain_name: string;
  hash: string;
  implementations: unknown[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: unknown;
  name: string;
  private_tags: unknown[];
  proxy_type: unknown;
  public_tags: unknown[];
  reputation: string;
  watchlist_names: unknown[];
}

export async function fetchReviewsByPlaceId(placeId: string) {
  const res = await fetch(
    `https://eth-sepolia.blockscout.com/api/v2/addresses/${reviewRegistryConfig.address}/logs`,
  );
  const data: EventLogs = await res.json();
  const placeData = data.items.filter((event) => {
    return event.decoded?.parameters.some(
      (p) => p.name === "placeId" && p.value === placeId,
    );
  });

  const reviews: ReviewData[] = await Promise.all(
    placeData.map(async (event) => {
      const params = event.decoded?.parameters;
      const ipfsParam = params?.find((p) => p.name === "ipfsHash");
      const reviewerParam = params?.find((p) => p.name === "reviewer");
      const cid = ipfsParam?.value;
      const reviewData = cid ? await getReviewByCID(cid) : null;

      return {
        reviewer: reviewerParam?.value ?? "Unknown reviewer",
        text: reviewData?.text ?? "Unknown review",
        rating: reviewData?.rating ?? 0,
      };
    }),
  );
  return reviews;
}
