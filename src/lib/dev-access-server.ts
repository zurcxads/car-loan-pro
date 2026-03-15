import { cookies } from 'next/headers';
import {
  DEV_ACCESS_COOKIE,
  DEV_FEATURE_FLAGS_COOKIE,
  parseDevFeatureFlags,
  verifyDevAccessToken,
} from '@/lib/dev-access';

export async function getServerDevAccessState() {
  const token = cookies().get(DEV_ACCESS_COOKIE)?.value;
  return verifyDevAccessToken(token);
}

export async function isServerDevAccessGranted(): Promise<boolean> {
  const result = await getServerDevAccessState();
  return result.valid;
}

export function getServerDevFeatureFlags() {
  const rawValue = cookies().get(DEV_FEATURE_FLAGS_COOKIE)?.value;
  return parseDevFeatureFlags(rawValue);
}
