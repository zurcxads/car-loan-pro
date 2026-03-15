import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DealerPortalClient from '@/components/portal/DealerPortalClient';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';

function getRoleRedirect(role?: string | null) {
  if (role === 'admin') return '/admin';
  if (role === 'lender') return '/lender';
  if (role === 'dealer') return '/dealer';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function DealerPage() {
  if (await isServerDevAccessGranted()) {
    return <DealerPortalClient user={{ name: 'Demo Dealer', email: 'dealer@demo.com', entityId: 'DLR-001' }} />;
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; name?: string | null; email?: string | null; entityId?: string | null } | undefined;

  if (!session || !user) {
    redirect('/login?redirect=/dealer');
  }

  if (user.role !== 'dealer') {
    redirect(getRoleRedirect(user.role));
  }

  return <DealerPortalClient user={{ name: user.name, email: user.email, entityId: user.entityId || null }} />;
}
