import { SkeletonOfferCards, SkeletonText } from '@/components/shared/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-live="polite">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</div>
          <div className="text-sm text-gray-600">Finding your rates...</div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Matching you with lenders...
          </div>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
            <SkeletonText width="w-72" className="h-10" />
            <SkeletonText width="w-56" />
          </div>
        </div>
        <SkeletonOfferCards count={3} />
      </div>
    </div>
  );
}
