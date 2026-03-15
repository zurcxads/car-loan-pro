import { redirect } from 'next/navigation';
import LenderPortalClient from '@/components/portal/LenderPortalClient';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';
import { getServerAuthSession } from '@/lib/api-helpers';

function getRoleRedirect(role?: string | null) {
  if (role === 'admin') return '/admin';
  if (role === 'dealer') return '/dealer';
  if (role === 'lender') return '/lender';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function LenderPage() {
  if (await isServerDevAccessGranted()) {
    return <LenderPortalClient user={{ name: 'Demo Lender', email: 'lender@demo.com', entityId: 'LND-001' }} />;
  }

  const session = await getServerAuthSession();
  const user = session?.user;

  if (!session || !user) {
    redirect('/login?redirect=/lender');
  }

  if (user.role !== 'lender') {
    redirect(getRoleRedirect(user.role));
  }

  return <LenderPortalClient user={{ name: user.name, email: user.email, entityId: user.entityId || null }} />;
}
