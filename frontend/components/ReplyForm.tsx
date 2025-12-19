"use client";

import { ReviewParams, useEvents } from "@/lib/blockscout";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReviewCard from "./ReviewCard";
import { UploadStage } from "./ReviewForm";
import { ReplyUpload, uploadReplyToIPFS } from "@/lib/storage";
import { submitReply } from "@/lib/contractActions";
import { showToast } from "@/lib/toast";

export default function ReplyForm() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [text, setText] = useState<string>("");
  const { fetchReviewByReviewId, refreshEvents } = useEvents();
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
  const router = useRouter();

  useEffect(() => {
    const fetchReview = async (id: string) => {
      setIsLoadingReview(true);
      try {
        const data = await fetchReviewByReviewId(Number(id));
        setReview(data);
      } catch (err) {
        console.error("Error when loading review:", err);
      } finally {
        setIsLoadingReview(false);
      }
    };
    if (reviewId) fetchReview(reviewId);
  }, [reviewId, fetchReviewByReviewId]);

  useEffect(() => {
    if (showModal) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [showModal]);

  const handleSubmit = async () => {
    console.log("Submitting reply:", reviewId, text);
    setShowModal(true);
    try {
      const replyData: ReplyUpload = {
        reviewId: reviewId,
        text: text,
      };
      setUploadStage("uploadingIPFS");
      const cid = await uploadReplyToIPFS(replyData);
      console.log("Reply submitted to IPFS:", cid);
      setUploadStage("awaitingTx");
      await submitReply(Number(reviewId), cid, 0);
      showToast("Your reply has been submitted!", "success");
      setUploadStage("completed");
      await refreshEvents();
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStage("error");
    }
  };

  const handleReturnToMap = () => {
    router.push(`/?placeId=${placeId}`);
  };
  const handleClose = () => {
    setShowModal(false);
    setUploadStage("idle");
  };

  return (
    <>
      {showModal && (
        <dialog ref={modalRef} className="modal">
          <div className="modal-box">
            {uploadStage === "uploadingIPFS" && (
              <>
                <h3 className="font-bold text-lg">Uploading to IPFS...</h3>
                <p>Storing your reply securely</p>
                <span className="loading loading-spinner mt-4"></span>
              </>
            )}
            {uploadStage === "awaitingTx" && (
              <>
                <h3 className="font-bold text-lg">
                  Awaiting Transaction Confirmation...
                </h3>
                <p>Please confirm in your wallet</p>
                <span className="loading loading-spinner mt-4"></span>
              </>
            )}
            {uploadStage === "completed" && (
              <>
                <h3 className="font-bold text-lg">Reply Submitted</h3>
                <p>Thank you for your feedback!</p>
                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn" onClick={handleReturnToMap}>
                      Return to Map
                    </button>
                  </form>
                </div>
              </>
            )}
            {uploadStage === "error" && (
              <>
                <h3 className="font-bold text-lg">Failed Submitting Reply</h3>
                <p>
                  Your reply could not be submitted. Please try again later.
                </p>
                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn" onClick={handleClose}>
                      Close
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </dialog>
      )}
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
            <ReviewCard params={review} disableVote />
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
            disabled={uploadStage !== "idle" || text.trim() == ""}
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
