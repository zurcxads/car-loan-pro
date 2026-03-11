import { redirect } from 'next/navigation';

export default function DashboardStatusRedirect() {
  redirect('/dashboard');
}
