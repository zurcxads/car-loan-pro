"use client";

type SkeletonTextProps = {
  className?: string;
  width?: string;
};

type SkeletonAvatarProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

type SkeletonCardProps = {
  className?: string;
  height?: string;
};

function baseSkeletonClassName(className = ''): string {
  return `animate-pulse bg-[#F6F9FC] ${className}`.trim();
}

export function SkeletonText({ className = '', width = 'w-full' }: SkeletonTextProps) {
  return (
    <div
      aria-hidden="true"
      className={`${baseSkeletonClassName(`h-4 ${width} rounded`)} ${className}`.trim()}
    />
  );
}

export function SkeletonAvatar({ className = '', size = 'md' }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div
      aria-hidden="true"
      className={`${baseSkeletonClassName(`${sizeClasses[size]} rounded-full flex-shrink-0`)} ${className}`.trim()}
    />
  );
}

export function SkeletonCard({ className = '', height = 'min-h-[300px]' }: SkeletonCardProps) {
  return (
    <div className={`rounded-xl border border-[#E3E8EE] bg-white p-6 ${height} ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="w-32" />
            <SkeletonText width="w-24" className="h-3" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <SkeletonText width="w-20" className="h-3 mb-2" />
          <SkeletonText width="w-full" className="h-12" />
        </div>
        <div>
          <SkeletonText width="w-20" className="h-3 mb-2" />
          <SkeletonText width="w-full" className="h-12" />
        </div>
        <div className="pt-4 border-t border-gray-200">
          <SkeletonText width="w-20" className="h-3 mb-2" />
          <SkeletonText width="w-32" className="h-6" />
        </div>
      </div>

      <div className="mt-6">
        <div aria-hidden="true" className={baseSkeletonClassName('h-12 w-full rounded-xl')} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonText key={i} width="w-24" className="h-3" />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonText key={colIndex} width={colIndex === 0 ? 'w-32' : 'w-20'} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Skeleton */}
      <div className="relative bg-gray-200 rounded-2xl p-8 h-64 overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
        <div className="relative z-10 space-y-4">
          <SkeletonText width="w-48" className="h-6" />
          <SkeletonText width="w-64" className="h-12" />
          <SkeletonText width="w-32" className="h-4" />
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <SkeletonText width="w-32" className="h-6 mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <SkeletonAvatar size="md" />
              <SkeletonText width="w-16" className="h-3 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="relative w-12 h-12 bg-gray-200 rounded-xl overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
              </div>
            </div>
            <SkeletonText width="w-32" className="h-5 mb-2" />
            <SkeletonText width="w-full" className="h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonOfferCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
