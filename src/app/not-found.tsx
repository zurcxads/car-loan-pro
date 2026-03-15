import Link from 'next/link';
import Footer from '@/components/shared/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-white">
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-3xl text-center">
          <p className="select-none text-[7rem] font-semibold leading-none text-[#E3E8EE] sm:text-[10rem]">
            404
          </p>
          <div className="-mt-4 rounded-[2rem] border border-[#E3E8EE] bg-white px-8 py-12 shadow-[0_24px_80px_rgba(10,37,64,0.08)]">
            <h1 className="text-3xl font-semibold text-[#0A2540] sm:text-4xl">Page not found</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#425466]">
              The page you are looking for does not exist or has been moved.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to home
              </Link>
              <Link
                href="/apply"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-[#F6F9FC]"
              >
                Get pre-approved
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
