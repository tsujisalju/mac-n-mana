"use client";

import { useStoracha } from "@/context/storacha";
import { submitReview } from "@/lib/contractActions";
import { Review } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewForm() {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId") ?? "";
  const name = searchParams.get("name");
  const router = useRouter();

  const storacha = useStoracha();

  useEffect(() => {
    if (!placeId || !name) {
      showToast("Unable to get restaurant info. Please search again.");
      router.push("/");
    }
  }, [placeId, name, router]);

  const handleSubmit = async () => {
    console.log("Submitting review:", placeId, text, rating);
    setIsLoading(true);
    try {
      if (!storacha) throw new Error("Storacha client not initialized");
      const review: Review = {
        placeId: placeId,
        text: text,
        rating: rating,
      };
      const blob = new Blob([JSON.stringify(review)], {
        type: "application/json",
      });
      const files = [new File([blob], "review.json")];
      const cid = await storacha.uploadDirectory(files);
      console.log("Review submitted to IPFS:", cid);
      await submitReview(placeId, cid.toString(), rating);
      showToast("Your review has been submitted!", "success");
      router.push("/");
    } catch (err) {
      console.error("Upload failed:", err);
      showToast(
        "Review could not be submitted. Please try again later.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold mt-4">{name}</h1>
        <h1 className="font-bold text-xl">Leave a Review</h1>
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
        <div className="rating flex flex-row space-x-4">
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
        <button type="submit" className="btn w-max mt-4" disabled={isLoading}>
          {isLoading && <span className="loading loading-spinner"></span>}
          Submit Review
        </button>
      </div>
    </form>
  );
}
