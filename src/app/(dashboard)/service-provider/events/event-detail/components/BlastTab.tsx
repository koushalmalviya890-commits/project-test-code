"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch"; // Using shadcn/ui Switch
import { Gift, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { 
  formatDateIST, 
  formatDateRangeIST, 
  getRelativeTimeIST,
  convertUTCtoIST 
} from "@/utils/dateTimeHelper";

// Helper for date formatting
const formatDateUTC = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const formatTimeUTC = (date: string) => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};
const formatTime = (date: string) => {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? date
    : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

// Props: eventData, refetch/blastUpdate?
interface BlastTabProps {
  eventData: any;
  onBlastUpdate?: () => void; // Optional callback to refresh parent
}

export default function BlastTab({ eventData, onBlastUpdate }: BlastTabProps) {
  const [eventReminder, setEventReminder] = useState(
    eventData.eventReminder ?? false
  );
  const [reminderLoading, setReminderLoading] = useState(false);

  // Toggle eventReminder
  const handleReminderToggle = async () => {
    setReminderLoading(true);
    try {
      // PUT to /api/events/:id/blast, only eventReminder field
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/api/event-details/${eventData._id}/blast`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventReminder: !eventReminder }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setEventReminder(data.event.eventReminder);
        toast.success("Event Reminders updated.");
        if (onBlastUpdate) onBlastUpdate();
      } else {
        toast.error(data.message || "Failed to update reminder.");
      }
    } catch (err) {
      toast.error("Could not update reminder.");
    }
    setReminderLoading(false);
  };

  return (
    <div className="bg-white  p-8 px-4 md:px-20 shadow-sm  w-full max-w-5xl ">
      {/* Event Reminders */}
      <div className="mb-12">
        <div className="flex items-center gap-8 mb-2">
          <span className="text-lg font-semibold">Event Reminders</span>
          <Switch
            checked={eventReminder}
            onCheckedChange={handleReminderToggle}
            disabled={reminderLoading}
          />
        </div>
        <p className="text-gray-500 text-sm mb-3">
          Reminders are sent automatically via email, SMS, and push
          notification.
        </p>
        {/* Example reminders (static for now) */}
        <div className="space-y-2 ml-1">
          <div>
            <span className="text-sm">Event is starting tomorrow</span>
            <span className="ml-3 text-green-600 font-semibold">
              TO: Going: <span>Before 1 day of event start date</span>
            </span>
          </div>
          <div>
            <span className="text-sm">Event is starting in 1 hour</span>
            <span className="ml-3 text-yellow-700 font-semibold">
              TO: scheduled: <span>Before 1 hour of event start time</span>
            </span>
          </div>
        </div>
      </div>

      {/* Post-Event Feedback section */}
      {eventData.postEventFeedback &&
        eventData.postEventFeedbackDetails &&
        eventData.postEventFeedbackDetails.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCcw className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">Post-Event Feedback</span>
            </div>
            {eventData.postEventFeedbackDetails.map(
              (feedback: any, idx: number) => (
                <div key={idx} className="ml-1 mb-2 flex flex-col gap-2 ">
                  <span className="text-sm text-gray-600 font-semibold">
                    Scheduled:{" "}
                    {feedback.scheduledDateTime
                      ? `${formatDateIST(feedback.scheduledDateTime , 'short')} (${getRelativeTimeIST(feedback.scheduledDateTime)})`
                      : "—"}
                  </span>
                  <div className="">
                    <span className="text-sm font-medium  text-gray-500">
                      Email content:
                    </span>
                    <div className="text-green-700 font-semibold">
                      {feedback.bodyContent}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

      {/* Coupons section */}
      {eventData.couponAvailability &&
        eventData.couponDetails &&
        eventData.couponDetails.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">Coupons</span>
              <span className="ml-2 text-sm font-normal text-gray-500">
                Create coupon codes that can be applied to the event
              </span>
            </div>
            <table className="min-w-full text-sm border mt-4 border-gray-200 rounded-xl">
              <thead>
                <tr className="bg-gray-50 text-gray-900 font-semibold border-b">
                  <th className="px-2 py-2 text-left">Coupon Code</th>
                  <th className="px-2 py-2 text-left">Offer</th>
                  <th className="px-2 py-2 text-left">Validity</th>
                </tr>
              </thead>
              <tbody>
                {eventData.couponDetails.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-2 py-2">{c.couponCode}</td>
                    <td className="px-2 py-2">
                      {c.discount ? `${c.discount}%` : ""}
                    </td>
                    <td className="px-2 py-2">
                      {c.validFrom && c.validTo
                        ? `${formatDate(c.validFrom)} - ${formatDate(c.validTo)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
