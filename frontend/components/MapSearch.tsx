"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MapSearch() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
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
      });
    };
    if (window.google) initMap();
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 flex flex-col space-y-2">
      <h1 className="text-xl font-bold">What are you craving today?</h1>
      <input
        id="search-input"
        placeholder="Search for a restaurant"
        className="input"
      />
      <div
        ref={mapRef}
        className="h-[400px] w-full rounded-md border-base-300 border-2"
      />
      {id && (
        <>
          <hr className="border-base-300 border-1" />
          <h1 className="text-3xl font-bold">{name}</h1>
          <Link href={`/review/${id}`} className="btn w-max">
            Make a review
          </Link>
        </>
      )}
    </div>
  );
}
