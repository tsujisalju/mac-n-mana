"use client";

import ReviewForm from "@/components/ReviewForm";
import Link from "next/link";
import * as React from "react";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = React.use(params);
  return (
    <main className="max-w-lg mx-auto">
      <Link href="/">↩ Back</Link>
      <h1 className="mt-4">Leave a Review</h1>
      <ReviewForm placeId={placeId} />
    </main>
  );
}
