import { createHash, randomInt } from 'crypto';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

type VerificationChannel = 'email' | 'phone';

const VERIFICATION_TTL_SECONDS = 10 * 60;
const verificationStore = new Map<string, { codeHash: string; expiresAt: string }>();

function normalizeRecipient(channel: VerificationChannel, recipient: string) {
  return channel === 'email' ? recipient.trim().toLowerCase() : recipient.trim();
}

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex');
}

function getStoreKey(channel: VerificationChannel, recipient: string) {
  return `${channel}:${normalizeRecipient(channel, recipient)}`;
}

export async function createVerificationCode(
  channel: VerificationChannel,
  recipient: string,
  userId?: string | null
) {
  const normalizedRecipient = normalizeRecipient(channel, recipient);
  const code = randomInt(0, 1000000).toString().padStart(6, '0');
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_SECONDS * 1000).toISOString();

  if (!isSupabaseConfigured()) {
    verificationStore.set(getStoreKey(channel, normalizedRecipient), { codeHash, expiresAt });
    return { code, expiresIn: VERIFICATION_TTL_SECONDS };
  }

  const supabase = getServiceClient();
  await supabase
    .from('verification_codes')
    .delete()
    .eq('channel', channel)
    .eq('recipient', normalizedRecipient)
    .is('verified_at', null);

  const { error } = await supabase
    .from('verification_codes')
    .insert({
      channel,
      recipient: normalizedRecipient,
      code_hash: codeHash,
      expires_at: expiresAt,
      created_by: userId || null,
    });

  if (error) {
    throw new Error(error.message || 'Failed to store verification code');
  }

  return { code, expiresIn: VERIFICATION_TTL_SECONDS };
}

export async function verifyStoredCode(
  channel: VerificationChannel,
  recipient: string,
  code: string
) {
  const normalizedRecipient = normalizeRecipient(channel, recipient);
  const codeHash = hashCode(code);

  if (!isSupabaseConfigured()) {
    const record = verificationStore.get(getStoreKey(channel, normalizedRecipient));
    if (!record) return false;

    if (new Date(record.expiresAt) < new Date() || record.codeHash !== codeHash) {
      return false;
    }

    verificationStore.delete(getStoreKey(channel, normalizedRecipient));
    return true;
  }

  const supabase = getServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('verification_codes')
    .select('id')
    .eq('channel', channel)
    .eq('recipient', normalizedRecipient)
    .eq('code_hash', codeHash)
    .is('verified_at', null)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  const { error: updateError } = await supabase
    .from('verification_codes')
    .update({ verified_at: now })
    .eq('id', data.id);

  if (updateError) {
    throw new Error(updateError.message || 'Failed to complete verification');
  }

  return true;
}
