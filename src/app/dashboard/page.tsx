import dynamic from "next/dynamic";

const DashboardPageClient = dynamic(() => import("@/components/dashboard/DashboardPageClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F9FC] text-[#6B7C93]">
      Loading dashboard...
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardPageClient />;
}
