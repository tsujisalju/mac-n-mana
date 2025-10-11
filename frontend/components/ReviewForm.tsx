"use client";

import { useState } from "react";

export default function ReviewForm({ placeId }: { placeId: string }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = async () => {
    console.log("Submitting review for", placeId, text, rating);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex flex-col space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your review"
          className="input"
        />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(+e.target.value)}
          min={1}
          max={5}
          className="input"
        />
        <button type="submit" className="btn w-max">
          Submit Review
        </button>
      </div>
    </form>
  );
}
