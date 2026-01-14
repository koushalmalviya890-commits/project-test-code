"use client";

import { SearchHeader } from "@/components/layout/search-header-event";
import { Footer } from "@/components/layout/footer";

export default function EventSearchPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
