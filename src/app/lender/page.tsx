import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LenderPortalClient from '@/components/portal/LenderPortalClient';

function getRoleRedirect(role?: string | null) {
  if (role === 'admin') return '/admin';
  if (role === 'dealer') return '/dealer';
  if (role === 'lender') return '/lender';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function LenderPage({
  searchParams,
}: {
  searchParams: Promise<{ dev?: string }>;
}) {
  const params = await searchParams;
  const isDevMode = process.env.NODE_ENV !== 'production' && params.dev === 'true';

  if (isDevMode) {
    return <LenderPortalClient user={{ name: 'Demo Lender', email: 'lender@demo.com' }} />;
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; name?: string | null; email?: string | null } | undefined;

  if (!session || !user) {
    redirect('/login?redirect=/lender');
  }

  if (user.role !== 'lender') {
    redirect(getRoleRedirect(user.role));
  }

  return <LenderPortalClient user={{ name: user.name, email: user.email }} />;
}
