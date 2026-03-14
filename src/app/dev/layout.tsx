import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isDev } from '@/lib/env';

export default function DevLayout({ children }: { children: ReactNode }) {
  if (!isDev()) {
    notFound();
  }

  return children;
}
