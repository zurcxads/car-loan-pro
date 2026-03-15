import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, requireAuth } from '@/lib/api-helpers';
import { useMockData as shouldUseMockData } from '@/lib/env';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const platformSettingsSchema = z.object({
  stipulation_rules: z.object({
    fico_720_plus: z.object({
      stips: z.array(z.string()),
      auto_approve: z.boolean(),
    }),
    fico_660_719: z.object({
      stips: z.array(z.string()),
      auto_approve: z.boolean(),
    }),
    fico_580_659: z.object({
      stips: z.array(z.string()),
      auto_approve: z.boolean(),
    }),
    fico_below_580: z.object({
      stips: z.array(z.string()),
      auto_approve: z.boolean(),
    }),
  }),
  application_settings: z.object({
    min_loan_amount: z.number(),
    max_loan_amount: z.number(),
    min_fico: z.number(),
    max_dti: z.number(),
  }),
  platform_settings: z.object({
    maintenance_mode: z.boolean(),
    registration_open: z.boolean(),
    show_apr_ranges_homepage: z.boolean(),
  }),
}).strict();

type PlatformSettings = z.infer<typeof platformSettingsSchema>;

const defaultSettings: PlatformSettings = {
  stipulation_rules: {
    fico_720_plus: {
      stips: ['Proof of income', 'Proof of residence'],
      auto_approve: true,
    },
    fico_660_719: {
      stips: ['Proof of income', 'Proof of residence', 'References'],
      auto_approve: false,
    },
    fico_580_659: {
      stips: ['Proof of income', 'Proof of residence', 'Bank statements', 'References'],
      auto_approve: false,
    },
    fico_below_580: {
      stips: ['Proof of income', 'Proof of residence', 'Bank statements', 'References', 'Down payment verification'],
      auto_approve: false,
    },
  },
  application_settings: {
    min_loan_amount: 5000,
    max_loan_amount: 75000,
    min_fico: 540,
    max_dti: 55,
  },
  platform_settings: {
    maintenance_mode: false,
    registration_open: true,
    show_apr_ranges_homepage: true,
  },
};

let mockSettings: PlatformSettings = defaultSettings;

async function readSettings(): Promise<PlatformSettings> {
  if (shouldUseMockData() || !isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return mockSettings;
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('config')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return defaultSettings;
    }

    const parsed = platformSettingsSchema.safeParse(data.config);
    return parsed.success ? parsed.data : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

async function writeSettings(settings: PlatformSettings): Promise<boolean> {
  if (shouldUseMockData() || !isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    mockSettings = settings;
    return true;
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('platform_settings').upsert({
      id: 'default',
      config: settings,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}

export async function GET() {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const settings = await readSettings();
  return NextResponse.json({ success: true, settings });
}

export async function PUT(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = platformSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid settings payload', 422);
  }

  const saved = await writeSettings(parsed.data);

  if (!saved) {
    return apiError('Failed to update settings', 500);
  }

  return NextResponse.json({ success: true, settings: parsed.data });
}
