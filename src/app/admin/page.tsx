import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminPortalClient from '@/components/portal/AdminPortalClient';

function getRoleRedirect(role?: string | null) {
  if (role === 'lender') return '/lender';
  if (role === 'dealer') return '/dealer';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ dev?: string }>;
}) {
  const params = await searchParams;
  const isDevMode = process.env.NODE_ENV !== 'production' && params.dev === 'true';

  if (isDevMode) {
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
