"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Review {
  startupName: string;
  rating: number;
  comment: string;
}

interface ReviewsDialogProps {
  facilityId: string;
}

export default function ReviewsDialog({ facilityId }: ReviewsDialogProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const apiUrl = "http://localhost:3001";

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("authUser");

      const res = await fetch(
        `${apiUrl}/api/reviews?facilityId=${facilityId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "", // Send token just in case
          },
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Failed to load reviews");

      const data = await res.json();

      // Safety check: Backend might return { reviews: [] } or just []
      // or if error handled gracefully, { reviews: undefined }
      if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && facilityId) fetchReviews();
  }, [open, facilityId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">See Reviews</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reviews</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No reviews found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Be the first to rate this facility!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="rounded-xl border p-4 shadow-sm bg-muted/30"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-base truncate max-w-[200px]">
                    {review.startupName || "Anonymous"}
                  </span>
                  <div className="flex space-x-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 break-words">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}