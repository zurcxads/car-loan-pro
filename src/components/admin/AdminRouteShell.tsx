"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/shared/Logo';

type AdminRouteShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  userLabel?: string;
};

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/applications', label: 'Partner Applications' },
];

export default function AdminRouteShell({
  children,
  title,
  subtitle,
  userLabel,
}: AdminRouteShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 flex-col border-r border-[#E3E8EE] bg-white px-5 py-6 lg:flex">
          <Link href="/" className="mb-8 block">
            <Logo size="sm" />
          </Link>
          <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
            Admin Portal
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-[#E3E8EE] pt-4">
            <div className="mb-3 text-xs text-slate-500">{userLabel ?? 'Admin'}</div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await createClient().auth.signOut();
                } catch {
                  // Ignore local preview logout errors.
                }
                router.push('/');
              }}
              className="rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#E3E8EE] bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Admin</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0A2540]">{title}</h1>
                {subtitle ? (
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                ) : null}
              </div>
              <Link
                href="/admin"
                className="rounded-full border border-[#D7E0EA] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
