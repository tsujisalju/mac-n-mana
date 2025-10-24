import { ReviewParams } from "@/lib/blockscout";
import { getReviewDataByCID } from "@/lib/storage";
import { truncateString } from "@/lib/truncate";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Review({ params }: { params: ReviewParams }) {
  const [text, setText] = useState<string | null>("");
  const [rating, setRating] = useState<number>(0);
  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getReview = async () => {
      setIsLoading(true);
      try {
        const review = await getReviewDataByCID(params.ipfsHash);
        console.log(params.ipfsHash, review);
        setText(review.text);
        setRating(review.rating);
        setImage(review.imageFilename ?? "");
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
  }, [params.ipfsHash]);

  return (
    <div className="flex flex-row p-4 border-2 border-base-300 rounded-md">
      <div className="flex flex-col grow space-y-2">
        <p className="font-bold">{truncateString(params.reviewer)}</p>
        {image && (
          <div className="carousel w-full h-[100px] rounded-md">
            <div className="carousel-item">
              <Image
                src={`https://${params.ipfsHash}.ipfs.dweb.link/${image}`}
                className="w-full"
                alt={"review photo"}
                width={100}
                height={100}
                unoptimized
              />
            </div>
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
    </div>
  );
}
