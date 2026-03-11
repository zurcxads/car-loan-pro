"use client";

import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="py-20 text-center">
      {icon && <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">{icon}</div>}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
