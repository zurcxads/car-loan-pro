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
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-zinc-400">{label}</div>
        {icon && <div className="text-gray-400 dark:text-zinc-500">{icon}</div>}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.3 }}
        className="text-2xl font-bold text-gray-900 dark:text-zinc-100"
      >
        {value}
      </motion.div>
      {delta && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2, duration: 0.2 }}
          className={`text-xs mt-1.5 font-medium ${
            deltaType === 'up' ? 'text-blue-600' : deltaType === 'down' ? 'text-red-500' : 'text-gray-500 dark:text-zinc-400'
          }`}
        >
          {deltaType === 'up' && '+'}{delta}
        </motion.div>
      )}
    </motion.div>
  );
}
