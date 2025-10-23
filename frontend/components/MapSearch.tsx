"use client";

import { fetchReviewsByPlaceId } from "@/lib/blockscout";
import { ReviewData } from "@/lib/storage";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

export default function MapSearch() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState<number>(0);

  const messages = [
    "Ate somewhere awesome today?",
    "Found a hidden food gem?",
    "What are you craving today?",
    "What's cooking?",
  ];

  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      setId("");
      setName("");
      setPhotos([]);
      setReviews([]);
    }
  }, [isConnected]);

  useEffect(() => {
    setRandomMessage(Math.floor(Math.random() * messages.length));
  }, [messages.length]);

  useEffect(() => {
    const fetchReview = async (placeId: string) => {
      setIsLoading(true);
      try {
        const data = await fetchReviewsByPlaceId(placeId);
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

  useEffect(() => {
    const initMap = () => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 3.139, lng: 101.6869 }, //KL center
        zoom: 14,
      });

      const input = document.getElementById("search-input") as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["restaurant"],
      });
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (
          !place ||
          !place.geometry ||
          !place.place_id ||
          !place.geometry.location
        )
          return;
        map.setCenter(place.geometry.location);
        map.setZoom(20);
        setId(place.place_id);
        setName(place.name ?? "Unidentified Restaurant");
        const photos = place.photos?.map((p) =>
          p.getUrl({ maxWidth: 400, maxHeight: 300 }),
        );
        setPhotos(photos ?? []);
      });
    };
    if (window.google) initMap();
  }, []);

return (
    // Keep original container styling
    <div className="max-w-lg mx-auto px-4 flex flex-col space-y-2">
      <h1 className="text-2xl font-bold">{messages[randomMessage]}</h1>
      {/* Keep original label styling */}
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
          placeholder="Search for a restaurant"
          type="text"
          className="grow"
        />
      </label>
      {/* Keep original map div styling */}
      <div
        ref={mapRef}
        className="h-[300px] xl:h-[90vh] w-full rounded-md border-base-300 border-2"
      />
      {id && (
        // Keep original result div styling
        <div className="flex flex-col space-y-4">
          <hr className="border-base-300 border-1" />
          <h1 className="text-3xl font-bold">{name}</h1>
          {/* Keep original Google photos carousel styling */}
          <div className="carousel w-full rounded-md">
            {photos.map((photo, index) => (
              <div key={index} id={`slide-${index}`} className="carousel-item">
                <Image
                  src={photo}
                  className="w-full"
                  alt={name + " photo " + index}
                  width={400}
                  height={300}
                  unoptimized // Add unoptimized if domain not in next.config
                />
              </div>
            ))}
          </div>
          {/* Keep original Link styling */}
          <Link
            href={`/review?placeId=${id}&name=${encodeURIComponent(name)}`} // Encode name
            className="btn btn-neutral w-max"
          >
            Make a review
          </Link>
          <h2 className="text-2xl font-bold">On-chain Reviews</h2>
          {isLoading ? (
            // Keep original loading indicator styling
            <div className="flex justify-center items-center py-4">
              <span className="loading loading-spinner"></span>
            </div>
          ) : (
             // Keep original reviews container styling
            <div className="flex flex-col space-y-2">
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  // Keep original individual review div styling
                  <div key={i}>
                    <p className="font-bold">{review.reviewer}</p>
                    {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="my-2 grid grid-cols-3 gap-2"> {/* Or use carousel/scroll */}
                            {review.imageUrls.map((imageUrl, imgIndex) => (
                                <Image
                                    key={imgIndex}
                                    src={imageUrl}
                                    alt={`Review image ${imgIndex + 1} by ${review.reviewer.substring(0, 8)}...`}
                                    width={100} // Smaller size for multiple images
                                    height={100}
                                    className="rounded-md object-cover w-full h-24" // Adjust styling
                                    unoptimized
                                    priority={i < 1 && imgIndex < 3} // Prioritize first review's images
                                />
                            ))}
                        </div>
                    )}
                    <p>{review.text}</p>
                    <div className="rating flex flex-row space-x-4">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <div
                          key={val}
                          className={`mask mask-star`} // Conditional styling for filled stars
                          aria-label={val + " star"}
                          aria-current={val == review.rating && "true"} // Less necessary with bg color
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                 // Keep original no-reviews message
                <p>No on-chain reviews found for this place.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
