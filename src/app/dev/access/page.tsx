import { redirect } from 'next/navigation';
import DevAccessForm from '@/components/dev/DevAccessForm';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';

export const dynamic = 'force-dynamic';

export default async function DevAccessPage() {
  const hasAccess = await isServerDevAccessGranted();

  if (hasAccess) {
    redirect('/dev');
  }

  return <DevAccessForm />;
}
