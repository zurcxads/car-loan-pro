"use client";

import { formatCurrency, formatRelativeTime } from '@/lib/format-utils';
import KPICard from '@/components/shared/KPICard';
import { useState, useEffect } from 'react';
import { dbGetApplications, dbGetOffers, dbGetActivityEvents, dbGetComplianceAlerts, dbGetPlatformStats } from '@/lib/db';
import type { MockApplication, MockOffer, ActivityEvent, ComplianceAlert } from '@/lib/mock-data';

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
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [apps, setApps] = useState<MockApplication[]>([]);
  const [offers, setOffers] = useState<MockOffer[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    totalOffers: 0,
    totalLenders: 0,
    activeLenders: 0,
    totalDealsFunded: 0,
    totalVolumeFunded: 0,
    avgApprovalRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [appsData, offersData, eventsData, alertsData, statsData] = await Promise.all([
          dbGetApplications(),
          dbGetOffers(),
          dbGetActivityEvents(),
          dbGetComplianceAlerts(),
          dbGetPlatformStats()
        ]);
        setApps(appsData);
        setOffers(offersData);
        setEvents(eventsData);
        setAlerts(alertsData);
        setStats(statsData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const offersToday = offers.filter(o => new Date(o.decisionAt).toDateString() === new Date().toDateString()).length || 0;
  const appsToday = apps.filter(a => new Date(a.submittedAt).toDateString() === new Date().toDateString()).length;
  const pendingAdverse = apps.filter(a => a.flags.some(f => f.includes('Adverse'))).length;

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KPICard label="Applications Today" value={appsToday} delay={0} />
        <KPICard label="Offers Sent Today" value={offersToday} delay={0.06} />
        <KPICard label="Funded Loans MTD" value={stats.totalDealsFunded} delay={0.12} />
        <KPICard label="Total Funded Volume" value={formatCurrency(stats.totalVolumeFunded)} delay={0.18} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Applications" value={stats.totalApplications} delay={0.24} />
        <KPICard label="Active Lenders" value={stats.activeLenders} delay={0.30} />
        <KPICard label="Total Offers" value={stats.totalOffers} delay={0.36} />
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
            {events.map(event => (
              <div key={event.id} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full ${eventColors[event.type]} mt-1.5 flex-shrink-0`} />
                <div>
                  <p className="text-xs text-gray-700">{event.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
