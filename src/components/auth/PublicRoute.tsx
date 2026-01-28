"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If we've finished checking the session and a user IS found
    if (!loading && user) {
      // Redirect them away from the login/signup pages
      const redirectTo = user.userType === "startup" 
        ? "/startup/dashboard" 
        : "/service-provider/dashboard";
        
      router.push(redirectTo);
    }
  }, [user, loading, router]);

  // Show a loading spinner while checking the session
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  // If NO user exists, render the login/signup form
  return !user ? <>{children}</> : null;
}
