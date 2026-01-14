"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import BookingDetailPopup from "./bookingDetail"

type PurchaseHoldDialogProps = {
      eventData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: () => void;
  minutes?: number; // default 10
  ticketCount?: number; // default 1
};

export function PurchaseHoldDialog({
eventData,
  open,
  onOpenChange,
  onStart,
  minutes = 10,
 ticketCount
}: PurchaseHoldDialogProps) {
  
  
  const [openState, setOpenState] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(minutes);

  const handleStart = () => {
    setTimerMinutes(minutes); // Pass the minutes to booking popup
    setOpenState(true);
    if (onStart) onStart();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xs md:max-w-sm w-full rounded-[22px] p-0 overflow-hidden border-0 shadow-lg bg-white">
          <div className="p-6 sm:p-7">
            <Image
              className="mx-auto mb-4"
              src="/Lock.png"
              alt="Lock"
              width={200}
              height={100}
              priority
            />

            <DialogHeader className="space-y-3 text-center">
              <DialogTitle className="text-[18px] leading-6 font-semibold text-zinc-900">
                You have {minutes} minutes to complete
                <br />
                your purchase
              </DialogTitle>

              <DialogDescription className="text-[14px] leading-6 text-zinc-500">
                The price of your tickets will be
                <br />
                locked during this time
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 sm:px-7 sm:pb-7">
            <Button
              onClick={handleStart}
              className="w-full h-11 rounded-[12px] bg-green-500 hover:bg-green-600 text-white text-[16px] font-medium"
            >
              Start
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BookingDetailPopup
        eventData={eventData}
        open={openState}
        onOpenChange={setOpenState}
        timerMinutes={timerMinutes} // Pass timer minutes
        ticketCount={ticketCount ?? 1} // Pass ticket count with default value
      />
    </>
  );
}


export default PurchaseHoldDialog;
