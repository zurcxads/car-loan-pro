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
      className="rounded-2xl surface p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{label}</div>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-zinc-50">{value}</div>
      {delta && (
        <div className={`text-xs mt-1.5 font-medium ${
          deltaType === 'up' ? 'text-green-400' : deltaType === 'down' ? 'text-red-400' : 'text-zinc-500'
        }`}>
          {deltaType === 'up' && '+'}{delta}
        </div>
      )}
    </motion.div>
  );
}
