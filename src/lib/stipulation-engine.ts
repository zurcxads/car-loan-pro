// Stipulation Engine
// Auto-generates required documents/actions based on application profile

export type StipulationType =
  | 'paystub'
  | 'bank_statement'
  | 'tax_return'
  | 'proof_of_residence'
  | 'employment_letter'
  | 'id_verification'
  | 'co_signer'
  | 'income_verification'
  | 'other';

export type StipulationStatus =
  | 'pending_upload'
  | 'uploaded'
  | 'under_review'
  | 'verified'
  | 'rejected';

export interface Stipulation {
  type: StipulationType;
  title: string;
  description: string;
  required: boolean;
  quantityRequired: number; // e.g., "2 recent paystubs"
  status: StipulationStatus;
  rejectionReason?: string;
}

export interface ApplicationProfile {
  ficoScore: number;
  employmentMonths: number;
  employmentStatus: string;
  grossMonthlyIncome: number;
  isSelfEmployed: boolean;
  hasIncomeMismatch: boolean; // If claimed income doesn't match credit report
  hasRedFlags: boolean; // Any other red flags
}

export interface StipulationRules {
  fico_720_plus: { stips: string[]; auto_approve: boolean };
  fico_660_719: { stips: string[]; auto_approve: boolean };
  fico_580_659: { stips: string[]; auto_approve: boolean };
  fico_below_580: { stips: string[]; auto_approve: boolean };
  self_employed: { stips: string[]; auto_approve: boolean };
  employment_lt_6_months: { stips: string[]; auto_approve: boolean };
  income_gt_8000: { stips: string[]; auto_approve: boolean };
  income_mismatch: { manual_review: boolean };
}

const DEFAULT_RULES: StipulationRules = {
  fico_720_plus: { stips: [], auto_approve: true },
  fico_660_719: { stips: ['paystub_2'], auto_approve: false },
  fico_580_659: { stips: ['bank_statement_3', 'proof_of_residence'], auto_approve: false },
  fico_below_580: { stips: ['bank_statement_3', 'proof_of_residence', 'co_signer_encouraged'], auto_approve: false },
  self_employed: { stips: ['bank_statement_3', 'tax_return_1'], auto_approve: false },
  employment_lt_6_months: { stips: ['employment_letter'], auto_approve: false },
  income_gt_8000: { stips: ['income_verification'], auto_approve: false },
  income_mismatch: { manual_review: true },
};

/**
 * Generate stipulations based on application profile
 */
export function generateStipulations(
  profile: ApplicationProfile,
  rules: StipulationRules = DEFAULT_RULES
): {
  stipulations: Stipulation[];
  requiresManualReview: boolean;
  approvalType: 'conditional' | 'clean' | 'none';
} {
  const stips: Stipulation[] = [];
  let requiresManualReview = false;
  let approvalType: 'conditional' | 'clean' | 'none' = 'clean';

  const { ficoScore, employmentMonths, isSelfEmployed, grossMonthlyIncome, hasIncomeMismatch, hasRedFlags } = profile;

  // Income mismatch = manual review
  if (hasIncomeMismatch || hasRedFlags) {
    requiresManualReview = true;
    approvalType = 'none';
  }

  // FICO-based rules
  if (ficoScore >= 720 && employmentMonths >= 24 && !isSelfEmployed) {
    // Perfect credit - no stips if income verified via Plaid
    if (!profile.hasIncomeMismatch) {
      approvalType = 'clean';
      return { stipulations: [], requiresManualReview: false, approvalType };
    }
  }

  // FICO 660-719
  if (ficoScore >= 660 && ficoScore < 720) {
    stips.push({
      type: 'paystub',
      title: '2 Recent Paystubs',
      description: 'Please upload your 2 most recent paystubs showing year-to-date earnings',
      required: true,
      quantityRequired: 2,
      status: 'pending_upload',
    });
    approvalType = 'conditional';
  }

  // FICO 580-659
  if (ficoScore >= 580 && ficoScore < 660) {
    stips.push(
      {
        type: 'bank_statement',
        title: '3 Months Bank Statements',
        description: 'Please upload your most recent 3 months of bank statements',
        required: true,
        quantityRequired: 3,
        status: 'pending_upload',
      },
      {
        type: 'proof_of_residence',
        title: 'Proof of Residence',
        description: 'Utility bill, lease agreement, or mortgage statement showing your current address',
        required: true,
        quantityRequired: 1,
        status: 'pending_upload',
      }
    );
    approvalType = 'conditional';
  }

  // FICO below 580
  if (ficoScore < 580) {
    stips.push(
      {
        type: 'bank_statement',
        title: '3 Months Bank Statements',
        description: 'Please upload your most recent 3 months of bank statements',
        required: true,
        quantityRequired: 3,
        status: 'pending_upload',
      },
      {
        type: 'proof_of_residence',
        title: 'Proof of Residence',
        description: 'Utility bill, lease agreement, or mortgage statement showing your current address',
        required: true,
        quantityRequired: 1,
        status: 'pending_upload',
      },
      {
        type: 'co_signer',
        title: 'Co-Signer (Recommended)',
        description: 'Adding a co-signer with good credit can significantly improve your approval odds and rate',
        required: false,
        quantityRequired: 1,
        status: 'pending_upload',
      }
    );
    approvalType = 'conditional';
  }

  // Self-employed
  if (isSelfEmployed) {
    stips.push(
      {
        type: 'bank_statement',
        title: '3 Months Bank Statements',
        description: 'Business and/or personal bank statements for the past 3 months',
        required: true,
        quantityRequired: 3,
        status: 'pending_upload',
      },
      {
        type: 'tax_return',
        title: 'Most Recent Tax Return',
        description: 'Full tax return including all schedules (1040 + Schedule C or 1099s)',
        required: true,
        quantityRequired: 1,
        status: 'pending_upload',
      }
    );
    approvalType = 'conditional';
  }

  // Employment < 6 months
  if (employmentMonths < 6) {
    stips.push({
      type: 'employment_letter',
      title: 'Employment Verification Letter',
      description: 'Offer letter or employment verification from your employer on company letterhead',
      required: true,
      quantityRequired: 1,
      status: 'pending_upload',
    });
    approvalType = 'conditional';
  }

  // High income claim
  if (grossMonthlyIncome > 8000) {
    stips.push({
      type: 'income_verification',
      title: 'Income Verification',
      description: 'Paystubs or bank statements to verify your stated income',
      required: true,
      quantityRequired: 2,
      status: 'pending_upload',
    });
    approvalType = 'conditional';
  }

  return {
    stipulations: stips,
    requiresManualReview,
    approvalType: requiresManualReview ? 'none' : stips.length > 0 ? 'conditional' : 'clean',
  };
}

/**
 * Check if all stipulations are verified
 */
export function areStipulationsComplete(stipulations: Stipulation[]): boolean {
  const requiredStips = stipulations.filter(s => s.required);
  return requiredStips.every(s => s.status === 'verified');
}

/**
 * Get stipulation status summary
 */
export function getStipulationSummary(stipulations: Stipulation[]): {
  total: number;
  pending: number;
  uploaded: number;
  verified: number;
  rejected: number;
  completionPercent: number;
} {
  const total = stipulations.filter(s => s.required).length;
  const pending = stipulations.filter(s => s.status === 'pending_upload').length;
  const uploaded = stipulations.filter(s => s.status === 'uploaded' || s.status === 'under_review').length;
  const verified = stipulations.filter(s => s.status === 'verified').length;
  const rejected = stipulations.filter(s => s.status === 'rejected').length;
  const completionPercent = total > 0 ? Math.round((verified / total) * 100) : 100;

  return { total, pending, uploaded, verified, rejected, completionPercent };
}

/**
 * Parse stip code (e.g., "paystub_2" -> type: paystub, quantity: 2)
 */
export function parseStipCode(code: string): { type: StipulationType; quantity: number } {
  const parts = code.split('_');
  const type = parts[0] as StipulationType;
  const quantity = parts.length > 1 ? parseInt(parts[parts.length - 1]) || 1 : 1;
  return { type, quantity };
}

/**
 * Get human-readable stipulation title
 */
export function getStipulationTitle(type: StipulationType, quantity: number = 1): string {
  const titles: Record<StipulationType, string> = {
    paystub: `${quantity} Recent Paystub${quantity > 1 ? 's' : ''}`,
    bank_statement: `${quantity} Month${quantity > 1 ? 's' : ''} Bank Statement${quantity > 1 ? 's' : ''}`,
    tax_return: `${quantity} Year${quantity > 1 ? 's' : ''} Tax Return${quantity > 1 ? 's' : ''}`,
    proof_of_residence: 'Proof of Residence',
    employment_letter: 'Employment Verification Letter',
    id_verification: 'ID Verification',
    co_signer: 'Co-Signer Information',
    income_verification: 'Income Verification',
    other: 'Additional Documentation',
  };
  return titles[type] || 'Document Required';
}

/**
 * Get stipulation description
 */
export function getStipulationDescription(type: StipulationType, quantity: number = 1): string {
  const descriptions: Record<StipulationType, string> = {
    paystub: `Please upload your ${quantity} most recent paystub${quantity > 1 ? 's' : ''} showing year-to-date earnings`,
    bank_statement: `Please upload your most recent ${quantity} month${quantity > 1 ? 's' : ''} of bank statements`,
    tax_return: `Full tax return for the past ${quantity} year${quantity > 1 ? 's' : ''} including all schedules`,
    proof_of_residence: 'Utility bill, lease agreement, or mortgage statement showing your current address',
    employment_letter: 'Offer letter or employment verification from your employer on company letterhead',
    id_verification: 'Government-issued photo ID (driver\'s license, passport, or state ID)',
    co_signer: 'Adding a co-signer with good credit can improve your approval odds and rate',
    income_verification: 'Documentation to verify your stated income (paystubs, bank statements, or tax returns)',
    other: 'Additional documentation as specified by the lender',
  };
  return descriptions[type] || 'Please upload the requested documentation';
}
