export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-600">Loading your offers...</p>
      </div>
    </div>
  );
}
