"use client";

import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AuthProvider>
      {children}
      <Toaster
        position={isMobile ? 'bottom-center' : 'top-right'}
        containerStyle={isMobile ? { bottom: 80 } : {}}
        toastOptions={{
          duration: 4000,
          className: 'touch-pan-y',
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: isMobile ? '90vw' : '420px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#FAFAFA' },
            style: {
              background: '#ffffff',
              border: '1px solid #10b981',
            },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#FAFAFA' },
            style: {
              background: '#ffffff',
              border: '1px solid #ef4444',
            },
          },
          loading: {
            iconTheme: { primary: '#2563eb', secondary: '#FAFAFA' },
            style: {
              background: '#ffffff',
              border: '1px solid #2563eb',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
