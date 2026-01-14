"use client";

export default function ViewDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Page Content */}
      <main className="flex-grow">{children}</main>
    </div>
  );
}
