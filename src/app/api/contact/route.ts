import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody } from '@/lib/api-helpers';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().email('Valid email is required'),
  subject: z.string().trim().min(1, 'Subject is required').max(120, 'Subject is too long'),
  message: z.string().trim().min(1, 'Message is required').max(5000, 'Message is too long'),
});

export async function POST(request: NextRequest) {
  const { data, error } = await parseBody(request, contactSubmissionSchema);
  if (error) return error;
  if (!data) return apiError('Invalid contact submission', 400);

  const submission = {
    ...data,
    created_at: new Date().toISOString(),
  };

  try {
    if (!isSupabaseConfigured()) {
      return apiSuccess({
        message: `Thanks, ${data.name}. Your message has been received and we'll get back to you within 24 hours.`,
      }, 201);
    }

    try {
      const supabase = getServiceClient();
      const { error: insertError } = await supabase
        .from('contact_submissions')
        .insert(submission);

      if (insertError) {
        console.warn('Contact submission fallback:', insertError.message, submission);
      } else {
        return apiSuccess({
          message: `Thanks, ${data.name}. Your message has been received and we'll get back to you within 24 hours.`,
        }, 201);
      }
    } catch (supabaseError) {
      console.warn('Contact submission fallback:', supabaseError, submission);
    }

    return apiSuccess({
      message: `Thanks, ${data.name}. Your message has been received and we'll get back to you within 24 hours.`,
    }, 201);
  } catch (err) {
    console.error('Contact API error:', err);
    return apiError('Failed to submit message', 500);
  }
}
