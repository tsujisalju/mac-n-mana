"use client";
// frontend/lib/blockscout.ts
import { createContext, ReactNode, useContext, useState } from "react";
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

export interface ReplyParams {
  reviewId: string;
  author: string;
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

const getLogsApiUrl = `https://eth-sepolia.blockscout.com/api/v2/addresses/${reviewRegistryConfig.address}/logs`;
const reviewMethodId = "352ee8b6";
const replyMethodId = "4c9b45fa";

async function getDecodedEvents(): Promise<Decoded[]> {
  const res = await fetch(getLogsApiUrl);
  if (!res.ok) {
    console.error(
      "Failed to fetch logs from Blockscout:",
      res.status,
      res.statusText,
    );
    return [];
  }
  const data: EventLogs = await res.json();
  const decodedEvents = data.items
    .map((event) => event.decoded ?? null)
    .filter((event) => event != null);
  return decodedEvents;
}

type EventsContextType = {
  events: Decoded[];
  fetchReviewsByPlaceId: (placeId: string) => Promise<ReviewParams[]>;
  fetchReviewByReviewId: (reviewId: number) => Promise<ReviewParams>;
  fetchRepliesByReviewId: (reviewId: number) => Promise<ReplyParams[]>;
  refreshEvents: () => Promise<void>;
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Decoded[] | null>(null);

  const fetchReviewByReviewId = async (
    reviewId: number,
  ): Promise<ReviewParams> => {
    let data: Decoded[];
    if (events != null) {
      data = events;
    } else {
      const raw = await getDecodedEvents();
      data = raw;
      setEvents(raw);
    }
    const reviewEvent = data.find(
      (event) =>
        event.method_id == reviewMethodId &&
        event.parameters.some(
          (p) => p.name == "reviewId" && p.value == reviewId.toString(),
        ),
    );
    if (reviewEvent) {
      return {
        reviewId:
          reviewEvent.parameters.find((p) => p.name == "reviewId")?.value ?? "",
        reviewer:
          reviewEvent.parameters.find((p) => p.name == "reviewer")?.value ?? "",
        placeId:
          reviewEvent.parameters.find((p) => p.name == "placeId")?.value ?? "",
        ipfsHash:
          reviewEvent.parameters.find((p) => p.name == "ipfsHash")?.value ?? "",
      };
    }
    console.error("No review found with this id.");
    return {
      reviewId: "",
      reviewer: "",
      placeId: "",
      ipfsHash: "",
    };
  };

  const fetchReviewsByPlaceId = async (
    placeId: string,
  ): Promise<ReviewParams[]> => {
    let data: Decoded[];
    if (events != null) {
      data = events;
    } else {
      const raw = await getDecodedEvents();
      data = raw;
      setEvents(raw);
    }
    return data
      .filter((event) => {
        if (event.method_id != reviewMethodId) return false;
        return event.parameters.some(
          (p) => p.name == "placeId" && p.value == placeId,
        );
      })
      .map((event) => {
        const reviewParams: ReviewParams = {
          reviewId:
            event.parameters.find((p) => p.name == "reviewId")?.value ?? "",
          reviewer:
            event.parameters.find((p) => p.name == "reviewer")?.value ?? "",
          placeId:
            event.parameters.find((p) => p.name == "placeId")?.value ?? "",
          ipfsHash:
            event.parameters.find((p) => p.name == "ipfsHash")?.value ?? "",
        };
        return reviewParams;
      });
  };

  const fetchRepliesByReviewId = async (
    reviewId: number,
  ): Promise<ReplyParams[]> => {
    let data: Decoded[];
    if (events != null) {
      data = events;
    } else {
      const raw = await getDecodedEvents();
      data = raw;
      setEvents(raw);
    }
    return data
      .filter(
        (event) =>
          event.method_id == replyMethodId &&
          event.parameters.some(
            (p) => p.name == "reviewId" && p.value == reviewId.toString(),
          ),
      )
      .map((event) => {
        const replyParams: ReplyParams = {
          reviewId:
            event.parameters.find((p) => p.name == "reviewId")?.value ?? "",
          author: event.parameters.find((p) => p.name == "author")?.value ?? "",
          ipfsHash:
            event.parameters.find((p) => p.name == "ipfsHash")?.value ?? "",
        };
        return replyParams;
      });
  };

  const refreshEvents = async () => {
    const raw = await getDecodedEvents();
    setEvents(raw);
  };

  return (
    <EventsContext.Provider
      value={{
        events: events ?? [],
        fetchRepliesByReviewId,
        fetchReviewByReviewId,
        fetchReviewsByPlaceId,
        refreshEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
};
