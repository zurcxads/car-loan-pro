import { SkeletonText } from '@/components/shared/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonText width="w-56" className="h-8 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}
