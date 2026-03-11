import { redirect } from 'next/navigation';

export default function DashboardOffersRedirect() {
  redirect('/dashboard?tab=offers');
}
