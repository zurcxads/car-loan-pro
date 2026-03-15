import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminPortalClient from '@/components/portal/AdminPortalClient';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';

function getRoleRedirect(role?: string | null) {
  if (role === 'lender') return '/lender';
  if (role === 'dealer') return '/dealer';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (await isServerDevAccessGranted()) {
    return <AdminPortalClient user={{ name: 'Admin (Dev)', email: 'admin@autoloanpro.co', entityId: null }} />;
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; name?: string | null; email?: string | null } | undefined;

  if (!session || !user) {
    redirect('/login?redirect=/admin');
  }

  if (user.role !== 'admin') {
    redirect(getRoleRedirect(user.role));
  }

  return <AdminPortalClient user={{ name: user.name, email: user.email, entityId: null }} />;
}
