import { SkeletonText } from '@/components/shared/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonText width="w-64" className="h-12 mb-8" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
