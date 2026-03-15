"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  DEFAULT_DEV_FEATURE_FLAGS,
  DEV_FEATURE_FLAGS_COOKIE,
  DEV_ACCESS_DURATION_MS,
  type DevFeatureFlags,
  serializeDevFeatureFlags,
} from '@/lib/dev-access';

interface EnvironmentInfo {
  appEnv: string;
  nodeEnv: string;
  supabaseConnected: boolean;
  vercelDeploymentId: string;
}

interface ApplicationRecord {
  created_at: string;
  id: string;
  name: string;
  status: string;
}

interface DevDashboardClientProps {
  environment: EnvironmentInfo;
}

interface ApiResponsePayload {
  data?: Record<string, unknown> | ApplicationRecord[];
  error?: string;
  success?: boolean;
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function FlagToggle({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (nextValue: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E3E8EE] bg-white px-4 py-4">
      <div>
        <p className="text-sm font-medium text-[#0A2540]">{label}</p>
        <p className="mt-1 text-sm text-[#6B7C93]">{description}</p>
      </div>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-[#C2CDD8]'}`}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

export default function DevDashboardClient({ environment }: DevDashboardClientProps) {
  const [apiBody, setApiBody] = useState('{\n  "example": true\n}');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiPath, setApiPath] = useState('/api/dev/verify');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [flags, setFlags] = useState<DevFeatureFlags>(DEFAULT_DEV_FEATURE_FLAGS);
  const [isCreating, setIsCreating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const actions = useMemo(() => [
    {
      action: async () => {
        setIsCreating(true);
        try {
          const response = await fetch('/api/dev/create-test-app', {
            body: JSON.stringify({ withVehicle: true }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          const payload = (await response.json()) as ApiResponsePayload;
          if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Failed to create test application');
          }
          toast.success('Test application created.');
          await loadApplications();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to create test application');
        } finally {
          setIsCreating(false);
        }
      },
      cta: isCreating ? 'Creating...' : 'Create',
      description: 'Create a synthetic borrower record and issue a fresh session.',
      href: null,
      title: 'Create Test Application',
    },
    {
      action: null,
      cta: 'Open',
      description: 'Open the admin portal in developer preview mode.',
      href: '/admin',
      title: 'View as Admin',
    },
    {
      action: null,
      cta: 'Open',
      description: 'Inspect the lender workspace with demo context.',
      href: '/lender',
      title: 'View as Lender',
    },
    {
      action: null,
      cta: 'Open',
      description: 'Review dealer workflows with developer access.',
      href: '/dealer',
      title: 'View as Dealer',
    },
    {
      action: async () => {
        await loadApplications();
        toast.success('Application list refreshed.');
      },
      cta: 'Refresh',
      description: 'Pull the latest recent applications from the platform.',
      href: null,
      title: 'View Applications',
    },
    {
      action: async () => {
        setIsResetting(true);
        try {
          const response = await fetch('/api/dev/reset-test-data', { method: 'POST' });
          const payload = (await response.json()) as { data?: { deleted?: number }; error?: string; success?: boolean };
          if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Failed to reset test data');
          }
          toast.success(`Removed ${payload.data?.deleted || 0} test application(s).`);
          await loadApplications();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to reset test data');
        } finally {
          setIsResetting(false);
        }
      },
      cta: isResetting ? 'Resetting...' : 'Reset',
      description: 'Delete applications created with @test.com identities.',
      href: null,
      title: 'Reset Test Data',
    },
  ], [isCreating, isResetting]);

  useEffect(() => {
    const storedFlags = window.localStorage.getItem(DEV_FEATURE_FLAGS_COOKIE);
    if (storedFlags) {
      try {
        setFlags({ ...DEFAULT_DEV_FEATURE_FLAGS, ...(JSON.parse(storedFlags) as Partial<DevFeatureFlags>) });
        return;
      } catch {
        window.localStorage.removeItem(DEV_FEATURE_FLAGS_COOKIE);
      }
    }

    const cookieFlags = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${DEV_FEATURE_FLAGS_COOKIE}=`));

    if (cookieFlags) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieFlags.slice(DEV_FEATURE_FLAGS_COOKIE.length + 1))) as Partial<DevFeatureFlags>;
        setFlags({ ...DEFAULT_DEV_FEATURE_FLAGS, ...parsed });
      } catch {
        document.cookie = `${DEV_FEATURE_FLAGS_COOKIE}=; path=/; max-age=0`;
      }
    }
  }, []);

  useEffect(() => {
    document.cookie = `${DEV_FEATURE_FLAGS_COOKIE}=${serializeDevFeatureFlags(flags)}; path=/; max-age=${DEV_ACCESS_DURATION_MS / 1000}; samesite=lax`;
    window.localStorage.setItem(DEV_FEATURE_FLAGS_COOKIE, JSON.stringify(flags));
  }, [flags]);

  useEffect(() => {
    void loadApplications();
  }, []);

  async function loadApplications() {
    setLoadingApplications(true);
    try {
      const response = await fetch('/api/dev/applications', { cache: 'no-store' });
      const payload = (await response.json()) as { data?: ApplicationRecord[]; error?: string; success?: boolean };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to load applications');
      }
      setApplications(payload.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  }

  async function handleApiTest() {
    if (!apiPath.startsWith('/api/')) {
      toast.error('Only /api/* endpoints are supported.');
      return;
    }

    setIsTestingApi(true);
    try {
      const init: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: apiMethod,
      };

      if (apiMethod === 'POST') {
        init.body = apiBody;
      }

      const response = await fetch(apiPath, init);
      const text = await response.text();
      let formatted = text;

      try {
        formatted = JSON.stringify(JSON.parse(text) as unknown, null, 2);
      } catch {
        formatted = text;
      }

      setApiResponse(`HTTP ${response.status}\n${formatted}`);
    } catch (error) {
      setApiResponse(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setIsTestingApi(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B7C93]">
              Internal Tooling
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0A2540]">
              Developer Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#425466]">
              Production-safe tooling for QA, access previews, and controlled test execution.
            </p>
          </div>
        </div>

        <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0A2540]">Environment</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#F6F9FC] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7C93]">NODE_ENV</p>
              <p className="mt-2 text-lg font-semibold text-[#0A2540]">{environment.nodeEnv}</p>
            </div>
            <div className="rounded-2xl bg-[#F6F9FC] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7C93]">App Env</p>
              <p className="mt-2 text-lg font-semibold text-[#0A2540]">{environment.appEnv}</p>
            </div>
            <div className="rounded-2xl bg-[#F6F9FC] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7C93]">Supabase</p>
              <p className="mt-2 text-lg font-semibold text-[#0A2540]">{environment.supabaseConnected ? 'Connected' : 'Offline'}</p>
            </div>
            <div className="rounded-2xl bg-[#F6F9FC] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7C93]">Deployment</p>
              <p className="mt-2 truncate text-lg font-semibold text-[#0A2540]">{environment.vercelDeploymentId}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0A2540]">Quick Actions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#E3E8EE] bg-[#FDFEFF] p-5">
                <h3 className="text-base font-semibold text-[#0A2540]">{item.title}</h3>
                <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#6B7C93]">{item.description}</p>
                <div className="mt-5">
                  {item.href ? (
                    <Link
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                      href={item.href}
                    >
                      {item.cta}
                    </Link>
                  ) : (
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => void item.action?.()}
                      type="button"
                    >
                      {item.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0A2540]">Recent Applications</h2>
              <button
                className="text-sm font-medium text-blue-600 transition hover:text-blue-500"
                onClick={() => void loadApplications()}
                type="button"
              >
                Refresh
              </button>
            </div>

            {loadingApplications ? (
              <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-10 text-center text-sm text-[#6B7C93]">
                Loading applications...
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#E3E8EE]">
                <table className="min-w-full divide-y divide-[#E3E8EE]">
                  <thead className="bg-[#F6F9FC]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7C93]">ID</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7C93]">Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7C93]">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7C93]">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8EE] bg-white">
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td className="px-4 py-3 text-sm font-medium text-[#0A2540]">{application.id}</td>
                        <td className="px-4 py-3 text-sm text-[#425466]">{application.name}</td>
                        <td className="px-4 py-3 text-sm text-[#425466]">{application.status}</td>
                        <td className="px-4 py-3 text-sm text-[#6B7C93]">{formatTimestamp(application.created_at)}</td>
                      </tr>
                    ))}
                    {applications.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-sm text-[#6B7C93]" colSpan={4}>
                          No applications available.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-[#0A2540]">Feature Flags</h2>
            </div>
            <div className="space-y-3">
              <FlagToggle
                checked={flags.mockData}
                description="Force mock-backed API and UI paths even when production services are configured."
                label="Mock Data"
                onChange={(nextValue) => setFlags((current) => ({ ...current, mockData: nextValue }))}
              />
              <FlagToggle
                checked={flags.verboseLogging}
                description="Enable louder console and response diagnostics while testing flows."
                label="Verbose Logging"
                onChange={(nextValue) => setFlags((current) => ({ ...current, verboseLogging: nextValue }))}
              />
              <FlagToggle
                checked={flags.apiInspector}
                description="Keep API testing tools enabled for ad hoc internal verification."
                label="API Tester"
                onChange={(nextValue) => setFlags((current) => ({ ...current, apiInspector: nextValue }))}
              />
            </div>
          </section>
        </div>

        <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[#0A2540]">API Tester</h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]" htmlFor="api-path">
                  Endpoint
                </label>
                <input
                  className="w-full rounded-2xl border border-[#D7DFE8] px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  id="api-path"
                  onChange={(event) => setApiPath(event.target.value)}
                  placeholder="/api/dev/verify"
                  value={apiPath}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]" htmlFor="api-method">
                  Method
                </label>
                <select
                  className="w-full rounded-2xl border border-[#D7DFE8] px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  id="api-method"
                  onChange={(event) => setApiMethod(event.target.value as 'GET' | 'POST')}
                  value={apiMethod}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]" htmlFor="api-body">
                  JSON Body
                </label>
                <textarea
                  className="min-h-[220px] w-full rounded-2xl border border-[#D7DFE8] px-4 py-3 font-mono text-sm text-[#0A2540] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  disabled={apiMethod !== 'POST'}
                  id="api-body"
                  onChange={(event) => setApiBody(event.target.value)}
                  value={apiBody}
                />
              </div>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isTestingApi}
                onClick={() => void handleApiTest()}
                type="button"
              >
                {isTestingApi ? 'Running...' : 'Send Request'}
              </button>
            </div>

            <div className="rounded-2xl border border-[#E3E8EE] bg-[#0A2540] p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9FB3C8]">
                Response
              </p>
              <pre className="min-h-[360px] overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-white">
                {apiResponse || 'Run a request to inspect the response payload.'}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
