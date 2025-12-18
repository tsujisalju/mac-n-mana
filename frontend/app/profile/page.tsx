import UserProfile from "@/components/UserProfile";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
        <p className="text-lg opacity-70">
          View your reputation and review history
        </p>
      </div>
      
      <Suspense
        fallback={
          <div className="grid place-items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="mt-4">Loading profile...</span>
          </div>
        }
      >
        <UserProfile />
      </Suspense>
    </main>
  );
}