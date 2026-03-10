"use client";

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#18181B',
            color: '#FAFAFA',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#FAFAFA' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FAFAFA' },
          },
        }}
      />
    </SessionProvider>
  );
}
