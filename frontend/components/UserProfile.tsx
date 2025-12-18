"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getUserReputation, getUserReviews } from "@/lib/contractActions";

interface Review {
  reviewId: number;
  reviewer: string;
  placeId: string;
  ipfsHash: string;
  rating: number;
  timestamp: bigint;
  reputationScore: bigint;
}

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const [reputation, setReputation] = useState<bigint | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!address || !isConnected) {
        setReputation(null);
        setReviews([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch user reputation
        const userRep = await getUserReputation(address);
        setReputation(userRep);

        // Fetch user reviews filtered by wallet address
        const userReviews = await getUserReviews(address);
        setReviews(userReviews);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl p-6">
        <p className="text-center text-lg">
          Please connect your wallet to view your profile
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid place-items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="mt-4">Loading your profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reputation Score Card */}
      <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Your Reputation</h2>
          <div className="stat">
            <div className="stat-value text-5xl">
              {reputation !== null ? reputation.toString() : "0"}
            </div>
            <div className="stat-desc text-primary-content/80">
              Total reputation points
            </div>
          </div>
          <p className="text-sm opacity-80">
            Earn reputation by writing helpful reviews and receiving upvotes
            from the community!
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Your Reviews</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">
                You haven't written any reviews yet
              </p>
              <p className="text-sm opacity-50 mt-2">
                Start sharing your dining experiences!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          Review #{review.reviewId}
                        </h3>
                        <p className="text-sm opacity-70">
                          Place ID: {review.placeId}
                        </p>
                      </div>
                      
                      {/* Rating Display */}
                      <div className="badge badge-primary badge-lg">
                        ⭐ {review.rating}/5
                      </div>
                    </div>

                    {/* Review Score */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="stat p-0">
                        <div className="stat-title text-xs">Review Score</div>
                        <div className={`stat-value text-2xl ${
                          Number(review.reputationScore) >= 0 
                            ? "text-success" 
                            : "text-error"
                        }`}>
                          {Number(review.reputationScore) >= 0 ? "+" : ""}
                          {review.reputationScore.toString()}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs opacity-50 mt-2">
                      {new Date(
                        Number(review.timestamp) * 1000
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* IPFS Link */}
                    <div className="card-actions justify-end mt-2">
                      <a
                        href={`https://ipfs.io/ipfs/${review.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        View on IPFS →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="divider"></div>
          
          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Total Reviews</div>
              <div className="stat-value">{reviews.length}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Average Rating</div>
              <div className="stat-value">
                {reviews.length > 0
                  ? (
                      reviews.reduce((sum, r) => sum + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)
                  : "0"}
              </div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Total Upvotes</div>
              <div className="stat-value text-success">
                {reviews.reduce(
                  (sum, r) => sum + Math.max(0, Number(r.reputationScore)),
                  0
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}