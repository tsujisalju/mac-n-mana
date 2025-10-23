import { ReviewData } from "@/lib/storage";
import { useState } from "react";

export default function Review({ cid }: { cid: string }) {
  const [review, setReview] = useState<ReviewData>();
  const [isLoading, setIsloading] = useState<boolean>(false);

  return (
    <div className="flex flex-row p-4 border-2 border-base-300 rounded-md">
      {review ? (
        <>
          <div className="flex flex-col grow space-y-2">
            <p className="font-bold">{review.reviewer}</p>
            <p>{review.text}</p>
            <div className="rating flex flex-row space-x-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <div
                  key={val}
                  className="mask mask-star"
                  aria-label={val + " star"}
                  aria-current={val == review.rating && "true"}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <button className="btn btn-square btn-ghost">
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
            <span className="font-bold">0</span>
            <button className="btn btn-square btn-ghost">
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
        </>
      ) : (
        <div className="flex flex-col justify-center items-center py-4">
          <span className="loading loading-spinner"></span>
          <span>Fetching review..</span>
        </div>
      )}
    </div>
  );
}
