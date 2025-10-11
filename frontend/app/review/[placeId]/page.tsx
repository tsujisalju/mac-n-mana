"use client";

import ReviewForm from "@/components/ReviewForm";
import * as React from "react";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = React.use(params);
  return (
    <main>
      <h1>Leave a Review</h1>
      <ReviewForm placeId={placeId} />
    </main>
  );
}
