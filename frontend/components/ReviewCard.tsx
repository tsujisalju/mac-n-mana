import { ReplyParams, ReviewParams, useEvents } from "@/lib/blockscout";
import { getReviewScore, voteReview } from "@/lib/contractActions";
import { getReviewDataByCID } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { truncateString } from "@/lib/truncate";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReplyCard from "./ReplyCard";

export default function ReviewCard({
  params,
  disableVote,
}: {
  params: ReviewParams;
  disableVote?: boolean | undefined;
}) {
  const [text, setText] = useState<string | null>("");
  const [rating, setRating] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [score, setScore] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchRepliesByReviewId } = useEvents();
  const [replyCount, setReplyCount] = useState<number>(0);
  const [replies, setReplies] = useState<ReplyParams[]>([]);
  const [showReplies, setShowReplies] = useState<boolean>(false);

  const handleVote = async (reviewId: number, vote: 1 | -1) => {
    try {
      await voteReview(reviewId, vote);
      showToast("You have voted for the review!", "success");
    } catch (err) {
      console.error("Vote failed:", err);
      showToast("Could not vote for review. Please try again later.", "error");
    } finally {
    }
  };

  const getScore = async (reviewId: number) => {
    try {
      return await getReviewScore(reviewId);
    } catch (err) {
      console.error("Could not get review score:", err);
    }
    return BigInt(0);
  };

  useEffect(() => {
    const getReview = async () => {
      setIsLoading(true);
      try {
        const review = await getReviewDataByCID(params.ipfsHash);
        const reviewScore = await getScore(Number(params.reviewId));
        const replyData = await fetchRepliesByReviewId(Number(params.reviewId));
        console.log(params.ipfsHash, review);
        setText(review.text);
        setRating(review.rating);
        setImages(review.imageFilenames ?? []);
        setScore(reviewScore);
        setReplyCount(replies.length);
        setReplies(replyData);
      } catch (err) {
        console.error(
          `Failed to get review data on IPFS for cid ${params.ipfsHash}`,
          err,
        );
        setText("");
      } finally {
        setIsLoading(false);
      }
    };
    getReview();
  }, [params, fetchRepliesByReviewId, replies.length]);

  return (
    <div className="flex flex-col p-4 border-2 border-base-300 rounded-md">
      <div className="flex flex-row">
        <div className="flex flex-col grow space-y-2">
          <p className="font-bold">{truncateString(params.reviewer)}</p>
          {images.length > 0 && (
            <div className="carousel w-full h-[100px] rounded-md">
              {images.map((fileName, i) => (
                <div key={i} className="carousel-item">
                  <Image
                    src={`https://${params.ipfsHash}.ipfs.dweb.link/${fileName}`}
                    className="w-full"
                    alt={"review photo"}
                    width={100}
                    height={100}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
          {!isLoading ? (
            <p>{text}</p>
          ) : (
            <span className="loading loading-spinner"></span>
          )}
          <div className="rating flex flex-row space-x-4">
            {[1, 2, 3, 4, 5].map((val) => (
              <div
                key={val}
                className="mask mask-star"
                aria-label={val + " star"}
                aria-current={val == rating && "true"}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="btn btn-square btn-ghost"
            onClick={() => handleVote(Number(params.reviewId), 1)}
            disabled={disableVote}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
          </button>
          <span className="font-bold">{Number(score).toString()}</span>
          <button
            className="btn btn-square btn-ghost"
            disabled={disableVote}
            onClick={() => handleVote(Number(params.reviewId), -1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>
      </div>
      {!disableVote && (
        <div className="mt-4 flex flex-row justify-between items-center">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setShowReplies((prev) => !prev);
            }}
          >
            {replyCount} Replies
          </button>
          <Link
            className="btn btn-ghost"
            href={`reply?placeId=${params.placeId}&reviewId=${params.reviewId}`}
          >
            Reply
          </Link>
        </div>
      )}
      {showReplies && (
        <div className="mt-4 flex flex-col pl-8 space-y-4">
          {replies.map((reply, index) => (
            <ReplyCard key={index} params={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
