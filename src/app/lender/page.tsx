import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { isDev } from '@/lib/env';
import LenderPortalClient from '@/components/portal/LenderPortalClient';

function getRoleRedirect(role?: string | null) {
  if (role === 'admin') return '/admin';
  if (role === 'dealer') return '/dealer';
  if (role === 'lender') return '/lender';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function LenderPage() {
  if (isDev()) {
    return <LenderPortalClient user={{ name: 'Demo Lender', email: 'lender@demo.com', entityId: 'LND-001' }} />;
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; name?: string | null; email?: string | null; entityId?: string | null } | undefined;

  if (!session || !user) {
    redirect('/login?redirect=/lender');
  }

  if (user.role !== 'lender') {
    redirect(getRoleRedirect(user.role));
  }

  return <LenderPortalClient user={{ name: user.name, email: user.email, entityId: user.entityId || null }} />;
}
