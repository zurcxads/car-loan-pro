"use client";

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  delay?: number;
}

export default function KPICard({ label, value, delta, deltaType = 'neutral', icon, delay = 0 }: KPICardProps) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="animate-fadeIn opacity-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500">{label}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div style={{ animationDelay: `${delay + 0.1}s` }} className="animate-fadeIn opacity-0 text-2xl font-bold text-gray-900">
        {value}
      </div>
      {delta && (
        <div
          style={{ animationDelay: `${delay + 0.2}s` }}
          className={`animate-fadeIn opacity-0 text-xs mt-1.5 font-medium ${
            deltaType === 'up' ? 'text-blue-600' : deltaType === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {deltaType === 'up' && '+'}{delta}
        </div>
      )}
    </div>
  );
}
