import ReviewForm from "@/components/ReviewForm";
import Link from "next/link";
import { Suspense } from "react";

export default function ReviewPage() {
  return (
    <main className="max-w-lg mx-auto px-4">
      <Link href="/">↩ Back</Link>
      <Suspense
        fallback={
          <div className="grid place-items-center">
            <span className="loading loading-spinner"></span>
            <span>Loading review form...</span>
          </div>
        }
      >
        <ReviewForm />
      </Suspense>
    </main>
  );
}
