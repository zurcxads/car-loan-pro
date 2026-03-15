import { redirect } from 'next/navigation';
import DevDashboardClient from '@/components/dev/DevDashboardClient';
import { getAppEnv } from '@/lib/env';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';
import { isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DevPage() {
  const hasAccess = await isServerDevAccessGranted();

  if (!hasAccess) {
    redirect('/dev/access');
  }

  return (
    <DevDashboardClient
      environment={{
        appEnv: getAppEnv(),
        nodeEnv: process.env.NODE_ENV || 'development',
        supabaseConnected: isSupabaseConfigured(),
        vercelDeploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'Unavailable',
      }}
    />
  );
}
