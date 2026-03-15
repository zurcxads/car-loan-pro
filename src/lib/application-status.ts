import type { ApplicationStatus } from '@/lib/types';

export type LegacyApplicationStatus = 'pending_decision' | 'offers_available' | 'conditional' | 'decisioned';

export type ApplicationStatusLike = ApplicationStatus | LegacyApplicationStatus | string;

const LEGACY_STATUS_MAP: Record<LegacyApplicationStatus, ApplicationStatus> = {
  pending_decision: 'processing',
  offers_available: 'offers_ready',
  conditional: 'under_review',
  decisioned: 'processing',
};

export function normalizeApplicationStatus(status: ApplicationStatusLike): ApplicationStatus {
  if (status in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[status as LegacyApplicationStatus];
  }

  return status as ApplicationStatus;
}

export function isClosedApplicationStatus(status: ApplicationStatusLike): boolean {
  const normalizedStatus = normalizeApplicationStatus(status);
  return normalizedStatus === 'expired' || normalizedStatus === 'declined' || normalizedStatus === 'cancelled' || normalizedStatus === 'funded';
}
