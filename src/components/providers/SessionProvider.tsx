"use client";

import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
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
    </AuthProvider>
  );
}
