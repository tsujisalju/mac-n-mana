"use client";

import { fetchReviewParamByReviewId, ReviewParams } from "@/lib/blockscout";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Review from "./Review";
import { UploadStage } from "./ReviewForm";

export default function ReplyForm() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [text, setText] = useState<string>("");
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [review, setReview] = useState<ReviewParams>({
    reviewId: "",
    ipfsHash: "",
    placeId: "",
    reviewer: "",
  });
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId") ?? "";
  const placeId = searchParams.get("placeId") ?? "";

  useEffect(() => {
    const fetchReview = async (id: string) => {
      setIsLoadingReview(true);
      try {
        const data = await fetchReviewParamByReviewId(id);
        setReview(data);
      } catch (err) {
        console.error("Error when loading review:", err);
      } finally {
        setIsLoadingReview(false);
      }
    };
    if (reviewId) fetchReview(reviewId);
  }, [reviewId]);

  const handleSubmit = async () => {
    setShowModal(true);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Link href={`/?placeId=${placeId}`}>↩ Back</Link>
        <div className="flex flex-col space-y-4">
          {isLoadingReview ? (
            <div className="flex flex-col justify-center items-center py-4">
              <span className="loading loading-spinner"></span>
              <span>Fetching review..</span>
            </div>
          ) : (
            <Review params={review} disableVote />
          )}
          <h1 className="font-bold text-xl">Leave a reply</h1>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your reply"
            className="textarea textarea-bordered w-full"
            rows={6}
          />
          <button
            type="submit"
            className="btn btn-neutral w-max"
            disabled={uploadStage !== "idle"}
          >
            {uploadStage !== "idle" && (
              <span className="loading loading-spinner"></span>
            )}
            Submit Reply
          </button>
        </div>
      </form>
    </>
  );
}
