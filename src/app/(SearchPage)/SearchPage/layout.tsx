'use client'

import { SearchHeader } from "@/components/layout/search-header";
import { Footer } from "@/components/layout/footer";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SearchPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Function to get booking link based on user type
  const getBookingLink = () => {
    return session?.user?.userType === 'startup'
      ? '/startup/bookings'
      : '/service-provider/dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SearchHeader />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
