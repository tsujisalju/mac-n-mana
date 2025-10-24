"use client";

import { submitReview } from "@/lib/contractActions";
import { ReviewUpload, uploadReviewToIPFS } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import Image from "next/image";

const MAX_PHOTOS = 10;

export default function ReviewForm() {
  const [text, setText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId") ?? "";
  const name = searchParams.get("name");
  const router = useRouter();

  useEffect(() => {
    if (!placeId || !name) {
      showToast("Unable to get restaurant info. Please search again.");
      router.push("/");
    }
  }, [placeId, name, router]);
  
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        const totalFiles = imageFiles.length + newFiles.length;

        if (totalFiles > MAX_PHOTOS) {
            showToast(`You can upload a maximum of ${MAX_PHOTOS} photos.`, "warning");
            return;
        }

        setImageFiles(prevFiles => [...prevFiles, ...newFiles]);

        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prevPreviews => [...prevPreviews, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
      setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
      setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {

    console.log("Submitting review:", placeId, text, rating, `${imageFiles.length} photos`);
    setIsLoading(true);
    try {
      const reviewData: ReviewUpload = {
        placeId: placeId,
        text: text,
        rating: rating,
      };
      const cid = await uploadReviewToIPFS(reviewData, imageFiles);
      console.log("Review submitted to IPFS:", cid);
      await submitReview(placeId, cid, rating);
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
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold mt-4">{name}</h1>
        <h1 className="font-bold text-xl">Leave a Review</h1>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your review (optional)"
          className="textarea textarea-bordered w-full"
          rows={6}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        <button
          type="button"
          onClick={handleCameraClick}
          className="btn w-max"
          disabled={isLoading || imageFiles.length >= MAX_PHOTOS}
        >
          {imageFiles.length > 0 ? `Add Photo (${imageFiles.length}/${MAX_PHOTOS})` : "Add Photos"} 
        </button>

        {imagePreviews.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2"> 
            {imagePreviews.map((previewUrl, index) => (
              <div key={index} className="relative group">
                <Image
                  src={previewUrl}
                  alt={`Review preview ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-full h-24" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  aria-label={`Remove image ${index + 1}`}
                  disabled={isLoading}
                >
                  ✕ 
                </button>
              </div>
            ))}
          </div>
        )}

        <label htmlFor="rating" className="font-bold">
          Rating
        </label>
        <div className="rating flex flex-row space-x-4">
          {[1, 2, 3, 4, 5].map((val) => (
            <input
              key={val}
              type="radio"
              name="rating"
              className="mask mask-star-2 "
              checked={rating == val}
              onChange={() => setRating(val)}
              aria-label={`${val} stars`}
            />
          ))}
        </div>
        <button type="submit" className="btn btn-neutral w-max" disabled={isLoading}>
          {isLoading && <span className="loading loading-spinner"></span>}
          Submit Review
        </button>
      </div>
    </form>
  );
}