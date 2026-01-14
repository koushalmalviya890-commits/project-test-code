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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId,
          startupId,
          incubatorId,
          facilityId,
          rating,
          comment,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error and reset state if needed
        toast.error(data.error || "Failed to submit review");
        setOpen(false); // ❌ Optional: Close even on error?
        setRating(0);
        setComment("");
        return;
      }

      toast.success("Review submitted successfully!");

      // Reset state on success
      setRating(0);
      setComment("");
      setOpen(false); // ✅ Close dialog
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong");

      setOpen(false); // Optional: only if you want to close on error
      setRating(0);
      setComment("");
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
        <div className="flex items-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={24}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className={`cursor-pointer transition-colors ${
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Comment Box */}
        <Textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
