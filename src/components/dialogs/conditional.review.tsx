"use client";

import { useSession } from "next-auth/react";
import Reviews from "../reviews"; // Adjust the import path as needed

export default function ConditionalReviews({ facilityId, serviceProvider }: { facilityId: string, serviceProvider: string }) {

  const { data: session, status } = useSession();

  if (status === "loading") return null; // or a loading spinner

  const isServiceProvider = session?.user?.id === serviceProvider;

  return (
    <>
      {!isServiceProvider && <Reviews facilityId={facilityId} />}
    </>
  );
}
