"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we've finished checking the session and no user is found
    if (!loading && !user) {
      // Save the current path to redirect back after login
      router.push(`/sign-in?from=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  // Show a loading spinner while checking the session
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  // If user exists, render the page content
  return user ? <>{children}</> : null;
}