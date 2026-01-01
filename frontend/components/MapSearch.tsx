// frontend/components/MapSearch.tsx
"use client";

import { ReviewParams, useEvents } from "@/lib/blockscout";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import ReviewCard from "./ReviewCard";
import { useSearchParams } from "next/navigation";

export default function MapSearch() {
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null,
  );
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(
    null,
  );
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsPanelRef = useRef<HTMLDivElement>(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const { fetchReviewsByPlaceId } = useEvents();
  const [reviews, setReviews] = useState<ReviewParams[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState<number>(0);
  const [mapReady, setMapReady] = useState<boolean>(false);

  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  const [destinationLatLng, setDestinationLatLng] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const messages = [
    "Ate somewhere awesome today?",
    "Found a hidden food gem?",
    "What are you craving today?",
    "What's cooking?",
  ];

  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const paramsPlaceId = searchParams.get("placeId");

  const clearNavigation = useCallback(() => {
    directionsRendererRef.current?.set("directions", null);
    if (directionsPanelRef.current) {
      directionsPanelRef.current.innerHTML = "";
    }
    setRouteInfo(null);
    setDestinationLatLng(null); // Add this to clear destination
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setId("");
      setName("");
      setReviews([]);
      clearNavigation();
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
      }
    }
  }, [isConnected, clearNavigation]);

  useEffect(() => {
    setRandomMessage(Math.floor(Math.random() * messages.length));
  }, [messages.length]);

  useEffect(() => {
    const fetchReview = async (placeId: string) => {
      setIsLoading(true);
      setReviews([]);
      try {
        const data = await fetchReviewsByPlaceId(placeId);
        setReviews(data);
      } catch (err) {
        console.error("Error when loading reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchReview(id);
  }, [id, fetchReviewsByPlaceId]);

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (
        !place ||
        !place.geometry ||
        !place.place_id ||
        !place.geometry.location
      )
        return;

      clearNavigation();

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

      // Add this to store destination lat/lng
      setDestinationLatLng({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    },
    [clearNavigation],
  );

  const handleOpenInGoogleMaps = () => {
    if (!destinationLatLng) return;

    const openMaps = (origin?: string) => {
      const url = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destinationLatLng.lat},${destinationLatLng.lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destinationLatLng.lat},${destinationLatLng.lng}`;
      window.open(url, "_blank");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          openMaps(origin);
        },
        (error) => {
          // If GPS fails, open Maps with destination only, let user input origin
          console.warn("No GPS, fallback to open Maps:", error);
          openMaps();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      // If geolocation not supported, open Maps with destination only
      openMaps();
    }
  };

  useEffect(() => {
    if (
      !mapReady ||
      !paramsPlaceId ||
      !placesServiceRef.current ||
      !mapInstanceRef.current
    )
      return;

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
          handlePlaceSelect(place);
        }
      },
    );
  }, [mapReady, paramsPlaceId, handlePlaceSelect]);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 3.139, lng: 101.6869 },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        clickableIcons: false,
      });

      mapInstanceRef.current = map;

      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
      });

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
          mapsMouseEvent:
            | google.maps.MapMouseEvent
            | google.maps.IconMouseEvent,
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
                    allowedTypes.includes(type),
                  );

                  if (isAllowedType) handlePlaceSelect(place);
                }
              },
            );
          }
        },
      );
      setMapReady(true);
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
          <div className="flex flex-col space-y-4 xl:h-[90vh] xl:overflow-y-auto pr-2">
            <hr className="border-base-300 border" />

            {routeInfo ? (
              <div className="card bg-base-200 shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h2 className="text-lg font-bold">Driving to {name}</h2>
                    <div className="flex space-x-4 text-sm mt-1">
                      <span className="badge badge-success text-white font-bold">
                        {routeInfo.duration}
                      </span>
                      <span className="badge badge-outline">
                        {routeInfo.distance}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={clearNavigation}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    ✕
                  </button>
                </div>
                <div
                  ref={directionsPanelRef}
                  className="h-96 overflow-y-auto text-sm border-t border-base-300 pt-2 bg-white text-black p-2 rounded-md"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{name}</h1>
                <div className="flex flex-row space-x-2">
                  <Link
                    href={`/review?placeId=${id}&name=${encodeURIComponent(name)}`}
                    className="btn btn-neutral w-max"
                  >
                    Make a review
                  </Link>
                  <button
                    onClick={handleOpenInGoogleMaps}
                    className="btn btn-primary w-max"
                  >
                    Open in Google Maps
                  </button>
                </div>
              </>
            )}

            {!routeInfo && (
              <>
                <h2 className="text-2xl font-bold">On-chain Reviews</h2>
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center py-4">
                    <span className="loading loading-spinner"></span>
                    <span>Fetching reviews..</span>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    {reviews.length > 0 ? (
                      reviews.map((review, i) => (
                        <ReviewCard key={i} params={review} />
                      ))
                    ) : (
                      <p>No on-chain reviews found for this place.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <div
        ref={mapRef}
        className="h-75 xl:h-[90vh] w-full rounded-md border-base-300 border-2"
      />
    </div>
  );
}
