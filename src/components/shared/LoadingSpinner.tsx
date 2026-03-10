"use client";

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative w-10 h-10 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-zinc-500">{message}</p>
      </div>
    </div>
  );
}
