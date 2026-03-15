import { notFound, redirect } from 'next/navigation';
import PartnerApplicationDetailClient from '@/components/admin/PartnerApplicationDetailClient';
import { getServerAuthSession } from '@/lib/api-helpers';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';
import { getPartnerApplicationDetail } from '@/lib/partner-applications';

function getRoleRedirect(role?: string | null) {
  if (role === 'lender') return '/lender';
  if (role === 'dealer') return '/dealer';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export const dynamic = 'force-dynamic';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AdminPartnerApplicationDetailPage({ params }: PageProps) {
  if (await isServerDevAccessGranted()) {
    const application = await getPartnerApplicationDetail(params.id);
    if (!application) {
      notFound();
    }

    return <PartnerApplicationDetailClient application={application} userLabel="Admin (Dev)" />;
  }

  const session = await getServerAuthSession();
  const user = session?.user;

  if (!session || !user) {
    redirect(`/login?redirect=/admin/applications/${params.id}`);
  }

  if (user.role !== 'admin') {
    redirect(getRoleRedirect(user.role));
  }

  const application = await getPartnerApplicationDetail(params.id);
  if (!application) {
    notFound();
  }

  return <PartnerApplicationDetailClient application={application} userLabel={user.name || user.email} />;
}
