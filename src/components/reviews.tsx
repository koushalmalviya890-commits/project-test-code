"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  startupName: string;
  rating: number;
  comment: string;
}

interface FacilityReviewsProps {
  facilityId: string;
}

export default function FacilityReviews({ facilityId }: FacilityReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?facilityId=${facilityId}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [facilityId]);

  return (
    <section className="mt-6 space-y-4">
      <h2 className="text-2xl font-semibold">What people say!</h2>

      {loading ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <div className="grid gap-4 w-1/2">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl border p-4 shadow-sm bg-muted/30"
            >
              <div className="flex gap-4 items-center mb-1">
                <span className="font-semibold">{review.startupName}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={`${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
