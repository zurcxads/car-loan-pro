"use client";

import { MOCK_APPLICATIONS, MOCK_ACTIVITY_EVENTS, MOCK_COMPLIANCE_ALERTS, MOCK_OFFERS } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime } from '@/lib/format-utils';
import KPICard from '@/components/shared/KPICard';
import { useState } from 'react';

const eventColors: Record<string, string> = {
  application: 'bg-blue-500',
  funded: 'bg-green-500',
  offer: 'bg-amber-500',
  declined: 'bg-red-500',
  system: 'bg-gray-400',
};

const alertTypeStyles: Record<string, { icon: string; border: string; text: string }> = {
  error: { icon: 'text-red-500', border: 'border-red-200', text: 'text-red-500' },
  warning: { icon: 'text-amber-600', border: 'border-amber-200', text: 'text-amber-600' },
  info: { icon: 'text-blue-600', border: 'border-blue-200', text: 'text-blue-600' },
  success: { icon: 'text-green-600', border: 'border-green-200', text: 'text-green-600' },
};

export default function PlatformOverview() {
  const [alerts, setAlerts] = useState(MOCK_COMPLIANCE_ALERTS);
  const apps = MOCK_APPLICATIONS;
  const funded = apps.filter(a => a.status === 'funded');
  const totalVolume = funded.reduce((s, a) => s + a.loanAmount, 0);
  const offersToday = MOCK_OFFERS.filter(o => new Date(o.decisionAt).toDateString() === new Date().toDateString()).length || 4;
  const pendingAdverse = 1;

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <div>
      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KPICard label="Applications Today" value="5" delta="+2 vs yesterday" deltaType="up" delay={0} />
        <KPICard label="Offers Sent Today" value={offersToday} delta="+1" deltaType="up" delay={0.06} />
        <KPICard label="Funded Loans MTD" value={funded.length} delay={0.12} />
        <KPICard label="Total Funded Volume" value={formatCurrency(totalVolume)} delay={0.18} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Revenue MTD" value="$4,820" delta="+12%" deltaType="up" delay={0.24} />
        <KPICard label="Active Lenders" value="6" delay={0.30} />
        <KPICard label="Dealer Partners" value="4" delay={0.36} />
        <KPICard label="Pending Adverse" value={pendingAdverse} delay={0.42} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Alerts Requiring Action</h3>
            <div className="space-y-2">
              {alerts.filter(a => !a.resolved).map(alert => {
                const styles = alertTypeStyles[alert.type];
                return (
                  <div key={alert.id} className={`rounded-xl bg-gray-50 border ${styles.border} p-4 flex items-start justify-between gap-3`}>
                    <div className="flex-1">
                      <p className={`text-sm ${styles.text}`}>{alert.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(alert.timestamp)}</p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-3 py-1.5 text-xs border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                      {alert.action}
                    </button>
                  </div>
                );
              })}
              {alerts.filter(a => !a.resolved).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No active alerts</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 max-h-[600px] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4">Live Activity Feed</h3>
          <div className="space-y-3">
            {MOCK_ACTIVITY_EVENTS.map(event => (
              <div key={event.id} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full ${eventColors[event.type]} mt-1.5 flex-shrink-0`} />
                <div>
                  <p className="text-xs text-gray-700">{event.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
