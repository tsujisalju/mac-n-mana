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
        <h1 className="font-sans font-bold text-xl mt-4">Leave a Review</h1>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your review"
          className="textarea w-full"
          rows={8}
        />
        <label htmlFor="rating" className="font-bold">
          Rating
        </label>
        <div className="rating">
          {[1, 2, 3, 4, 5].map((val) => (
            <input
              key={val}
              type="radio"
              name="rating"
              className="mask mask-star-2"
              checked={rating == val}
              onChange={() => setRating(val)}
            />
          ))}
        </div>
        <button type="submit" className="btn w-max mt-4">
          Submit Review
        </button>
      </div>
    </form>
  );
}
