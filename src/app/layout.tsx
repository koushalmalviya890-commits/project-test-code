import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";
import { ChatButton } from "@/components/chat/ChatButton";
import WhatsappChat from "@/components/whatsapp/whatsapp";
import NextTopLoader from "nextjs-toploader";
import { EventFormProvider } from "../app/(dashboard)/service-provider/events/services/contexts/EventFormContext";
export const metadata: Metadata = {
  title: "Cumma - Startup Workspace Platform",
  description: "Find and book the perfect workspace for your startup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-jakarta">
        {/* Top Loader */}
        <NextTopLoader
          color="#16A34A" // replace with your primary color hex
          initialPosition={0.3}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={400}
        />

        <AuthProvider>
          <EventFormProvider>
          {children}
          </EventFormProvider>
          <Toaster />
          <ChatButton />
          <WhatsappChat />
        </AuthProvider>
      </body>
    </html>
  );
}
