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
    <main className="max-w-lg mx-auto px-4">
      <Link href="/">↩ Back</Link>
      <ReviewForm placeId={placeId} />
    </main>
  );
}
