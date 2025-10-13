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
    "https://eth-sepolia.blockscout.com/api/v2/addresses/0xD888020802d9EfcE18F5dC2Df9d6DEfcCd49BDB8/logs",
  );
  const data: EventLogs = await res.json();
  return data.items.filter((event) =>
    event.decoded.parameters.some(
      (p) => p.name === "placeId" && p.value === placeId,
    ),
  );
}
