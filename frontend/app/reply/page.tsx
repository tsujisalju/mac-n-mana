import ReplyForm from "@/components/ReplyForm";
import { Suspense } from "react";

export default function ReplyPage() {
  return (
    <main className="max-w-lg mx-auto px-4">
      <Suspense
        fallback={
          <div className="grid place-items-center">
            <span className="loading loading-spinner"></span>
            <span>Loading reply form...</span>
          </div>
        }
      >
        <ReplyForm />
      </Suspense>
    </main>
  );
}
