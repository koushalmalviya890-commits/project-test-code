"use client";

// import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext"
import Reviews from "../reviews"; // Adjust the import path as needed

export default function ConditionalReviews({ facilityId, serviceProvider }: { facilityId: string, serviceProvider: string }) {

  // const { data: session, status } = useSession();
  const { user, loading } = useAuth();

  if (loading) return null; // or a loading spinner
  //

  // if (status === "loading") return null; // or a loading spinner

  // const isServiceProvider = session?.user?.id === serviceProvider;

  const isServiceProvider = user?.id === serviceProvider;

  return (
    <>
      {!isServiceProvider && <Reviews facilityId={facilityId} />}
    </>
  );
}
