"use client";

import { formatRelativeTime } from '@/lib/format-utils';
import { useState, useEffect, useMemo } from 'react';
import { dbGetApplications, dbGetOffers, dbGetActivityEvents, dbGetComplianceAlerts } from '@/lib/db';
import { showDevTools } from '@/lib/env';
import type { MockApplication, ActivityEvent, ComplianceAlert } from '@/lib/mock-data';
import { LineChart, DonutChart, DistributionBars, TrendIndicator } from '@/components/shared/charts';

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

interface AdminSummary {
  appsToday: number;
  pendingApplications: number;
  offersToday: number;
  fundedThisWeek: number;
  totalApplications: number;
  avgApprovalRate: number;
}

export default function PlatformOverview() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [apps, setApps] = useState<MockApplication[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [statsRes, eventsRes, alertsRes] = await Promise.all([
          fetch('/api/admin/stats', { cache: 'no-store' }),
          fetch('/api/admin/stats?type=events', { cache: 'no-store' }),
          fetch('/api/admin/stats?type=compliance', { cache: 'no-store' }),
        ]);

        if (!statsRes.ok || !eventsRes.ok || !alertsRes.ok) {
          throw new Error('Failed to load admin dashboard');
        }

        const [statsJson, eventsJson, alertsJson] = await Promise.all([
          statsRes.json(),
          eventsRes.json(),
          alertsRes.json(),
        ]);

        setSummary(statsJson.data || null);
        setEvents(eventsJson.data || []);
        setAlerts(alertsJson.data || []);

        const isDevMode = showDevTools();
        if (isDevMode) {
          const [appsData] = await Promise.all([dbGetApplications(), dbGetOffers()]);
          setApps(appsData);
        } else {
          setApps([]);
        }
      } catch (fetchError) {
        const isDevMode = showDevTools();
        if (!isDevMode) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load admin dashboard');
        } else {
          const [appsData, offersData, eventsData, alertsData] = await Promise.all([
            dbGetApplications(),
            dbGetOffers(),
            dbGetActivityEvents(),
            dbGetComplianceAlerts(),
          ]);
          setApps(appsData);
          setEvents(eventsData);
          setAlerts(alertsData);
          setSummary({
            appsToday: appsData.filter((app) => new Date(app.submittedAt).toDateString() === new Date().toDateString()).length,
            pendingApplications: appsData.filter((app) => app.status === 'pending_decision').length,
            offersToday: offersData.filter((offer) => new Date(offer.decisionAt).toDateString() === new Date().toDateString()).length,
            fundedThisWeek: appsData.filter((app) => app.status === 'funded').length,
            totalApplications: appsData.length,
            avgApprovalRate: appsData.length
              ? Math.round((appsData.filter((app) => ['offers_available', 'conditional', 'funded'].includes(app.status)).length / appsData.length) * 100)
              : 0,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert)));
  };

  const appsOverTime = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => ({
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: apps.filter((app) => app.submittedAt.split('T')[0] === date).length,
    }));
  }, [apps]);

  const creditScoreDist = useMemo(() => {
    const buckets = { 'Prime\n(720+)': 0, 'Near-Prime\n(660-719)': 0, 'Subprime\n(<660)': 0 };
    apps.forEach((app) => {
      if (!app.credit.ficoScore) return;
      if (app.credit.ficoScore >= 720) buckets['Prime\n(720+)']++;
      else if (app.credit.ficoScore >= 660) buckets['Near-Prime\n(660-719)']++;
      else buckets['Subprime\n(<660)']++;
    });
    return Object.entries(buckets).map(([label, value]) => ({
      label,
      value,
      color: label.includes('Prime\n(720') ? '#22C55E' : label.includes('Near') ? '#3B82F6' : '#F59E0B',
    }));
  }, [apps]);

  const revenueData = useMemo(() => {
    const last6Months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return last6Months.map((month) => ({
      label: month,
      value: 12000 + Math.random() * 8000,
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Dashboard unavailable</h3>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">No admin data yet</h3>
        <p className="text-sm text-gray-500">Once applications and lender activity are stored in Supabase, metrics will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Apps Today</div>
          <TrendIndicator value={summary.appsToday} deltaPercent={12.5} />
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Pending Review</div>
          <div className="text-2xl font-semibold text-gray-900">{summary.pendingApplications}</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Offers Extended</div>
          <TrendIndicator value={summary.offersToday} deltaPercent={8.2} />
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Funded This Week</div>
          <TrendIndicator value={summary.fundedThisWeek} deltaPercent={-3.1} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Applications Over Time</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          {appsOverTime.some((point) => point.value > 0) ? (
            <LineChart data={appsOverTime} height={200} color="#3B82F6" />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-500">No application history yet.</div>
          )}
        </div>

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Approval Rate</h3>
          <DonutChart
            data={[
              { label: 'Approved', value: summary.avgApprovalRate, color: '#22C55E' },
              { label: 'Declined', value: 100 - summary.avgApprovalRate, color: '#EF4444' },
            ]}
            size={180}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Credit Score Distribution</h3>
          {creditScoreDist.some((bucket) => bucket.value > 0) ? (
            <DistributionBars data={creditScoreDist} />
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-gray-500">Credit distribution will populate as applications arrive.</div>
          )}
        </div>

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${eventColors[event.type]} mt-1.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed">{event.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-sm text-gray-500">No platform activity yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Revenue (Last 6 Months)</h3>
          <LineChart data={revenueData} height={200} color="#22C55E" />
        </div>
      </div>

      {alerts.filter((alert) => !alert.resolved).length > 0 && (
        <div className="mt-6 rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Alerts Requiring Action</h3>
          <div className="space-y-2">
            {alerts.filter((alert) => !alert.resolved).map((alert) => {
              const styles = alertTypeStyles[alert.type];
              return (
                <div key={alert.id} className={`rounded-lg bg-gray-50  border ${styles.border} p-3 flex items-start justify-between gap-3`}>
                  <div className="flex-1">
                    <p className={`text-sm ${styles.text}`}>{alert.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(alert.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    {alert.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
