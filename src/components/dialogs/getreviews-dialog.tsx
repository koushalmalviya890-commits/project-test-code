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
    if (open) fetchReviews();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reviews</Button>
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
          <p className="text-sm text-gray-500 py-4">No reviews found.</p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="rounded-xl border p-4 shadow-sm bg-muted/30"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-base">
                    {review.startupName}
                  </span>
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
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
