// frontend/components/MapSearch.tsx
"use client";

import { fetchReviewParamsByPlaceId, ReviewParams } from "@/lib/blockscout";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import Review from "./Review";
import { useSearchParams } from "next/navigation";

export default function MapSearch() {
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [reviews, setReviews] = useState<ReviewParams[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState<number>(0);

  const messages = [
    "Ate somewhere awesome today?",
    "Found a hidden food gem?",
    "What are you craving today?",
    "What's cooking?",
  ];

  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const paramsPlaceId = searchParams.get("placeId");

  // Modified useEffect for disconnection: Clear search input value
  useEffect(() => {
    if (!isConnected) {
      setId("");
      setName("");
      setPhotos([]);
      setReviews([]);
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
      }
    }
  }, [isConnected]);

  useEffect(() => {
    setRandomMessage(Math.floor(Math.random() * messages.length));
  }, [messages.length]);

  useEffect(() => {
    const fetchReview = async (placeId: string) => {
      setIsLoading(true);
      setReviews([]);
      try {
        const data = await fetchReviewParamsByPlaceId(placeId);
        console.log(data);
        setReviews(data);
      } catch (err) {
        console.error("Error when loading reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchReview(id);
  }, [id]);

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (
        !place ||
        !place.geometry ||
        !place.place_id ||
        !place.geometry.location
      )
        return;

      // Update map view
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(place.geometry.location);
        mapInstanceRef.current.setZoom(17);
      }

      setId(place.place_id);
      const placeName = place.name ?? "Unidentified Place";
      setName(placeName);

      if (searchInputRef.current) {
        searchInputRef.current.value = placeName;
      }

      const photosUrls = place.photos?.map((p) =>
        p.getUrl({ maxWidth: 400, maxHeight: 300 })
      );
      setPhotos(photosUrls ?? []);
    },
    []
  );

  useEffect(() => {
    if (paramsPlaceId && placesServiceRef.current && mapInstanceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: paramsPlaceId,
          fields: ["place_id", "name", "geometry", "photos", "types"],
        },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry
          ) {
            handlePlaceSelect(place); // reuse your existing logic
          } else {
            console.warn("Failed to hydrate place from placeId:", status);
          }
        }
      );
    }
  }, [paramsPlaceId, handlePlaceSelect]);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 3.139, lng: 101.6869 }, // KL center
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
      });

      mapInstanceRef.current = map;

      placesServiceRef.current = new google.maps.places.PlacesService(map);

      const input = searchInputRef.current;
      if (!input) return;

      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["cafe", "restaurant", "food", "bakery", "bar"],
        fields: ["place_id", "name", "geometry", "photos"],
      });
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        handlePlaceSelect(place);
      });

      map.addListener(
        "click",
        (
          mapsMouseEvent: google.maps.MapMouseEvent | google.maps.IconMouseEvent
        ) => {
          const placeId = (mapsMouseEvent as google.maps.IconMouseEvent)
            .placeId;

          if (placeId && placesServiceRef.current) {
            if (
              "stop" in mapsMouseEvent &&
              typeof mapsMouseEvent.stop === "function"
            ) {
              mapsMouseEvent.stop();
            }

            placesServiceRef.current.getDetails(
              {
                placeId: placeId,
                fields: ["place_id", "name", "geometry", "photos", "types"],
              },
              (place, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  place
                ) {
                  const allowedTypes = [
                    "cafe",
                    "restaurant",
                    "food",
                    "bakery",
                    "bar",
                    "meal_delivery",
                    "meal_takeaway",
                  ];
                  const placeTypes = place.types || [];
                  const isAllowedType = placeTypes.some((type) =>
                    allowedTypes.includes(type)
                  );

                  if (isAllowedType) {
                    handlePlaceSelect(place);
                  } else {
                    console.log(
                      "Clicked place is not a relevant food place:",
                      place.name,
                      place.types
                    );
                  }
                } else {
                  console.error("PlacesService failed:", status);
                }
              }
            );
          }
        }
      );
    };

    if (window.google && window.google.maps && window.google.maps.places) {
      initMap();
    } else {
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          initMap();
          clearInterval(intervalId);
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, [handlePlaceSelect]);

  return (
    <div className="px-4 flex flex-col space-y-2 xl:space-x-4 h-full xl:flex-row">
      <div className="xl:w-lg flex flex-col space-y-2 xl:h-[90vh]">
        <h1 className="text-2xl font-bold">{messages[randomMessage]}</h1>
        <label className="input w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="opacity-20 size-6"
          >
            <path
              fillRule="evenodd"
              d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            id="search-input"
            ref={searchInputRef}
            placeholder="Search for a restaurant"
            type="text"
            className="grow"
          />
        </label>
        {id && (
          <div className="flex flex-col space-y-4 xl:h-[90vh] xl:overflow-y-auto">
            <hr className="border-base-300 border-1" />
            <h1 className="text-3xl font-bold">{name}</h1>
            {photos.length > 0 && (
              <div className="h-[300px]">
                <div className="carousel rounded-md">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      id={`slide-${index}`}
                      className="carousel-item"
                    >
                      <Image
                        src={photo}
                        className="w-full"
                        alt={name + " photo " + index}
                        width={400}
                        height={300}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Link
              href={`/review?placeId=${id}&name=${encodeURIComponent(name)}`} // Encode name
              className="btn btn-neutral w-max"
            >
              Make a review
            </Link>
            <h2 className="text-2xl font-bold">On-chain Reviews</h2>
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-4">
                <span className="loading loading-spinner"></span>
                <span>Fetching reviews..</span>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {reviews.length > 0 ? (
                  reviews.map((review, i) => <Review key={i} params={review} />)
                ) : (
                  <p>No on-chain reviews found for this place.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        ref={mapRef}
        className="h-[300px] xl:h-[90vh] w-full rounded-md border-base-300 border-2"
      />
    </div>
  );
}
