"use client";

import { useState  , useEffect} from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewsDialogProps {
  bookingId: string;
  incubatorId: string;
  startupId: string;
  facilityId: string;
}

export default function RateReviewDialog({
  facilityId,
  bookingId,
  incubatorId,
  startupId,
}: ReviewsDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = "http://localhost:3001";

  const handleSubmit = async () => {
    // Validation: Ensure rating is selected
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const token = sessionStorage.getItem("authUser");
    if (!token) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ 2. Update Fetch Call
      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        // ✅ 3. CRITICAL: Send auth cookies to Express
        credentials: "include",
        body: JSON.stringify({
          bookingId,
          startupId,
          incubatorId,
          facilityId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit review");
        // Don't close dialog on error so user can fix/retry
        return;
      }

      toast.success("Review submitted successfully!");

      // Reset state on success
      setRating(0);
      setComment("");
      setOpen(false); 
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

useEffect(()=>{
  // Reset state when dialog opens
  if (!open) {
    setRating(0);
    setComment("");
    setHoverRating(0);
  }
}, [open]);

return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Rate & Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate & Review</DialogTitle>
        </DialogHeader>

        {/* Star Rating */}
        <div className="flex items-center justify-center space-x-2 mb-4 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32} // Made slightly larger for better UX
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className={`cursor-pointer transition-colors duration-200 ${
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        
        {/* Rating Label (Optional UX improvement) */}
        <div className="text-center text-sm text-gray-500 mb-4 h-5">
          {hoverRating > 0 ? (
            <span>
              {hoverRating === 1 && "Poor"}
              {hoverRating === 2 && "Fair"}
              {hoverRating === 3 && "Average"}
              {hoverRating === 4 && "Good"}
              {hoverRating === 5 && "Excellent"}
            </span>
          ) : rating > 0 ? (
            <span>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </span>
          ) : null}
        </div>

        {/* Comment Box */}
        <Textarea
          placeholder="Share your experience with this facility..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}