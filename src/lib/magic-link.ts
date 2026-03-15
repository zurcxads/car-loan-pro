import { createClient } from '@/lib/supabase/server';
import { serverLogger } from '@/lib/server-logger';

export interface MagicLinkToken {
  id: string;
  email: string;
  token: string;
  application_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

type ValidMagicLinkToken = {
  applicationId: string;
  email: string;
  id: string;
};

/**
 * Generate a magic link token and store it in the database
 * @param email - User email
 * @param applicationId - Associated application ID
 * @returns The generated token string
 */
export async function generateMagicToken(
  email: string,
  applicationId: string
): Promise<{ token: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Generate secure random token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store in database
    const { error } = await supabase
      .from('magic_links')
      .insert({
        email: email.toLowerCase(),
        token,
        application_id: applicationId,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      serverLogger.error('Failed to create magic link', { error: error instanceof Error ? error.message : String(error) });
      return { token: '', error: 'Failed to generate magic link' };
    }

    return { token };
  } catch (err) {
    serverLogger.error('Magic link generation error', { error: err instanceof Error ? err.message : String(err) });
    return { token: '', error: 'Internal error' };
  }
}

/**
 * Verify a magic link token
 * @param token - The token to verify
 * @returns Application ID and email if valid, null if invalid/expired
 */
export async function getValidMagicToken(
  token: string
): Promise<ValidMagicLinkToken | null> {
  try {
    const supabase = await createClient();

    // Find the token
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .single();

    if (error || !data) {
      return null;
    }

    const magicLink = data as MagicLinkToken;

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(magicLink.expires_at);
    if (now > expiresAt) {
      return null;
    }

    return {
      id: magicLink.id,
      applicationId: magicLink.application_id,
      email: magicLink.email,
    };
  } catch (err) {
    serverLogger.error('Magic link verification error', { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function consumeMagicToken(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('id', id)
      .is('used_at', null);

    return !error;
  } catch (err) {
    serverLogger.error('Magic link consume error', { error: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

export async function verifyMagicToken(
  token: string
): Promise<{ applicationId: string; email: string } | null> {
  const magicLink = await getValidMagicToken(token);
  if (!magicLink) {
    return null;
  }

  const consumed = await consumeMagicToken(magicLink.id);
  if (!consumed) {
    return null;
  }

  return {
    applicationId: magicLink.applicationId,
    email: magicLink.email,
  };
}

/**
 * Clean up expired magic links (call this periodically via cron)
 */
export async function cleanupExpiredMagicLinks(): Promise<void> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    await supabase
      .from('magic_links')
      .delete()
      .lt('expires_at', now);
  } catch (err) {
    serverLogger.error('Failed to cleanup expired magic links', { error: err instanceof Error ? err.message : String(err) });
  }
}
