"use client";

import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{label}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {delta && (
        <div className={`text-xs mt-1.5 font-medium ${
          deltaType === 'up' ? 'text-green-600' : deltaType === 'down' ? 'text-red-500' : 'text-gray-500'
        }`}>
          {deltaType === 'up' && '+'}{delta}
        </div>
      )}
    </motion.div>
  );
}
