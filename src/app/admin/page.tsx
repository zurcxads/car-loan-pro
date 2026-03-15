import { redirect } from 'next/navigation';
import AdminPortalClient from '@/components/portal/AdminPortalClient';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';
import { getServerAuthSession } from '@/lib/api-helpers';
import { listPartnerApplications } from '@/lib/partner-applications';

function getRoleRedirect(role?: string | null) {
  if (role === 'lender') return '/lender';
  if (role === 'dealer') return '/dealer';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const pendingApplications = await listPartnerApplications({ status: 'pending' });

  if (await isServerDevAccessGranted()) {
    return (
      <AdminPortalClient
        pendingApplications={pendingApplications}
        user={{ name: 'Admin (Dev)', email: 'admin@autoloanpro.co', entityId: null }}
      />
    );
  }

  const session = await getServerAuthSession();
  const user = session?.user;

  if (!session || !user) {
    redirect('/login?redirect=/admin');
  }

  if (user.role !== 'admin') {
    redirect(getRoleRedirect(user.role));
  }

  return (
    <AdminPortalClient
      pendingApplications={pendingApplications}
      user={{ name: user.name, email: user.email, entityId: null }}
    />
  );
}
