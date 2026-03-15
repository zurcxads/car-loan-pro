import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody } from '@/lib/api-helpers';
import { useMockData as shouldUseMockData } from '@/lib/env';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const dealerApplicationSchema = z.object({
  dealershipName: z.string().min(1).max(200),
  dealerLicenseNumber: z.string().min(1).max(100),
  primaryContactName: z.string().min(1).max(150),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  state: z.string().min(2).max(2),
  zip: z.string().regex(/^\d{5}$/),
  monthlyVehicleSalesVolume: z.enum(['1-10', '11-25', '26-50', '51-100', '100+']),
  vehicleTypes: z.array(z.enum(['New', 'Used', 'CPO'])).min(1),
  certifiedAccurate: z.literal(true),
});

export async function POST(request: NextRequest) {
  const { data, error } = await parseBody(request, dealerApplicationSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    serverLogger.info('Dealer application submitted', {
      dealershipName: data.dealershipName,
      email: data.email,
      dealerLicenseNumber: data.dealerLicenseNumber,
    });

    if (shouldUseMockData()) {
      return apiSuccess({ success: true });
    }

    if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return apiError('Unable to process request', 503);
    }

    const supabase = getServiceClient();
    const payload = {
      dealership_name: data.dealershipName,
      dealer_license_number: data.dealerLicenseNumber,
      primary_contact_name: data.primaryContactName,
      email: data.email,
      phone: data.phone,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
      monthly_vehicle_sales_volume: data.monthlyVehicleSalesVolume,
      vehicle_types: data.vehicleTypes,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    const primaryInsert = await supabase.from('dealer_applications').insert(payload);
    if (primaryInsert.error) {
      const fallbackInsert = await supabase.from('dealers').insert({
        name: data.dealershipName,
        city: data.city,
        state: data.state,
        address: data.street,
        zip: data.zip,
        phone: data.phone,
        website: '',
        contact_email: data.email,
        franchise_brands: data.vehicleTypes,
        buyers_sent_mtd: 0,
        deals_funded_mtd: 0,
        plan: 'trial',
        plan_price: 0,
        billing_date: new Date().toISOString(),
        status: 'pending',
        joined_date: new Date().toISOString(),
        team_members: [{
          name: data.primaryContactName,
          email: data.email,
          role: 'Primary Contact',
          status: 'pending',
          addedDate: new Date().toISOString(),
        }],
      });

      if (fallbackInsert.error) {
        serverLogger.error('Dealer application persistence failed', {
          dealerApplicationsError: primaryInsert.error.message,
          dealersError: fallbackInsert.error.message,
        });
        return apiError('Unable to process request', 500);
      }
    }

    return apiSuccess({ success: true });
  } catch (routeError) {
    serverLogger.error('Dealer application route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Unable to process request', 500);
  }
}
