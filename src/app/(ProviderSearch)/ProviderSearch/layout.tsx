'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface ProviderSearchLayoutProps {
  children: ReactNode;
}

export default function ProviderSearchLayout({ children }: ProviderSearchLayoutProps) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-white">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
