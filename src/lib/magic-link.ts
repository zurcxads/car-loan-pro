import { createClient } from '@/lib/supabase/server';

export interface MagicLinkToken {
  id: string;
  email: string;
  token: string;
  application_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

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
      console.error('Failed to create magic link:', error);
      return { token: '', error: 'Failed to generate magic link' };
    }

    return { token };
  } catch (err) {
    console.error('Magic link generation error:', err);
    return { token: '', error: 'Internal error' };
  }
}

/**
 * Verify a magic link token
 * @param token - The token to verify
 * @returns Application ID and email if valid, null if invalid/expired
 */
export async function verifyMagicToken(
  token: string
): Promise<{ applicationId: string; email: string } | null> {
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

    // Mark as used
    await supabase
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('id', magicLink.id);

    return {
      applicationId: magicLink.application_id,
      email: magicLink.email,
    };
  } catch (err) {
    console.error('Magic link verification error:', err);
    return null;
  }
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
    console.error('Failed to cleanup expired magic links:', err);
  }
}
