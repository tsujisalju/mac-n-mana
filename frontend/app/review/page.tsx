"use client";

import ReviewForm from "@/components/ReviewForm";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId") ?? "";
  const name = searchParams.get("name") ?? "";

  useEffect(() => {
    if (!placeId || !name) {
      showToast("Unable to get restaurant info. Please search again.");
      router.push("/");
    }
  }, [placeId, name, router]);

  return (
    <main className="max-w-lg mx-auto px-4">
      <Link href="/">↩ Back</Link>
      <ReviewForm placeId={placeId} name={name} />
    </main>
  );
}
