import { redirect } from 'next/navigation';
import PartnerApplicationsPageClient from '@/components/admin/PartnerApplicationsPageClient';
import { getServerAuthSession } from '@/lib/api-helpers';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';

function getRoleRedirect(role?: string | null) {
  if (role === 'lender') return '/lender';
  if (role === 'dealer') return '/dealer';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

export default async function AdminPartnerApplicationsPage() {
  if (await isServerDevAccessGranted()) {
    return <PartnerApplicationsPageClient userLabel="Admin (Dev)" />;
  }

  const session = await getServerAuthSession();
  const user = session?.user;

  if (!session || !user) {
    redirect('/login?redirect=/admin/applications');
  }

  if (user.role !== 'admin') {
    redirect(getRoleRedirect(user.role));
  }

  return <PartnerApplicationsPageClient userLabel={user.name || user.email} />;
}
