// Core types based on PRD database schema

export type UserRole = 'consumer' | 'dealer' | 'lender' | 'admin';
export type ApplicationStatus = 'draft' | 'submitted' | 'decisioned' | 'expired' | 'funded';
export type ApplicationType = 'new_vehicle' | 'used_vehicle' | 'refinance' | 'private_party';
export type VehicleCondition = 'new' | 'used' | 'certified_pre_owned';
export type ResidenceType = 'own' | 'rent' | 'other';
export type EmploymentStatus = 'full_time' | 'part_time' | 'self_employed' | 'retired' | 'other';
export type IncomeType = 'employment' | 'self_employed' | 'retirement' | 'disability' | 'ssi' | 'child_support' | 'other';
export type LenderTier = 'prime' | 'near_prime' | 'subprime' | 'specialty';
export type OfferStatus = 'pending' | 'available' | 'approved' | 'conditional' | 'declined' | 'expired' | 'selected' | 'locked';
export type CreditPullType = 'soft' | 'hard';

// Step 1: Personal Info
export interface BorrowerPersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  ssn: string;
  dob: string;
  driversLicenseNumber?: string;
  driversLicenseState?: string;
  email: string;
  phone: string;
  preferredLanguage?: 'english' | 'spanish' | 'other';
}

// Step 2: Address
export interface AddressInfo {
  currentAddressLine1: string;
  currentAddressLine2?: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  residenceType: ResidenceType;
  monthlyHousingPayment: number;
  monthsAtCurrentAddress: number;
  prevAddressLine1?: string;
  prevAddressCity?: string;
  prevAddressState?: string;
  prevAddressZip?: string;
  monthsAtPrevAddress?: number;
}

// Step 3: Employment & Income
export interface EmploymentInfo {
  employmentStatus: EmploymentStatus;
  employerName?: string;
  employerAddress?: string;
  employerPhone?: string;
  jobTitle?: string;
  monthsAtEmployer: number;
  grossMonthlyIncome: number;
  incomeTypePrimary: IncomeType;
  otherIncomeSource?: string;
  otherIncomeMonthly?: number;
  incomeVerificationMethod?: string;
  // Previous employer (if current < 24 months)
  prevEmployerName?: string;
  prevJobTitle?: string;
  prevMonthsAtEmployer?: number;
}

// Step 4: Vehicle (OPTIONAL - for pre-approval with vehicle)
export interface VehicleInfo {
  applicationType?: ApplicationType;
  vehicleCondition?: VehicleCondition;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;
  mileage?: number;
  askingPrice?: number;
  isPrivateParty?: boolean;
  dealerName?: string;
  dealerZip?: string;
}

// Step 5: Deal Structure (partially optional - core fields required)
export interface DealStructure {
  cashDownPayment?: number;
  hasTradeIn?: boolean;
  tradeInYear?: number;
  tradeInMake?: string;
  tradeInModel?: string;
  tradeInVin?: string;
  tradeInPayoffAmount?: number;
  desiredTermMonths: 36 | 48 | 60 | 72 | 84;
  maxMonthlyPayment?: number;
  gapInsuranceInterest?: boolean;
  extendedWarrantyInterest?: boolean;
}

// Step 7: Consent
export interface ConsentInfo {
  softPullConsent: boolean;
  hardPullConsent: boolean;
  tcpaConsent: boolean;
  termsOfService: boolean;
  privacyPolicy: boolean;
  eSignConsent: boolean;
}

// Full Application
export interface Application {
  id: string;
  userId: string;
  status: ApplicationStatus;
  personalInfo: BorrowerPersonalInfo;
  addressInfo: AddressInfo;
  employmentInfo: EmploymentInfo;
  vehicleInfo?: VehicleInfo; // Optional - pre-approval without vehicle
  dealStructure: DealStructure;
  consent: ConsentInfo;
  hasCoBorrower: boolean;
  coBorrowerInfo?: BorrowerPersonalInfo & AddressInfo & EmploymentInfo;
  hasVehicle: boolean; // Track whether vehicle info was provided
  createdAt: string;
  submittedAt?: string;
  expiresAt?: string;
}

// Lender Offer
export interface LenderOffer {
  id: string;
  applicationId: string;
  lenderName: string;
  lenderLogo?: string;
  tier: LenderTier;
  status: OfferStatus;
  approvedAmount: number;
  maxApprovedAmount?: number; // For no-vehicle pre-approvals (range ceiling)
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  conditions?: string[];
  decisionAt: string;
  expiresAt: string;
}

// Credit Pull Result
export interface CreditPullResult {
  ficoScore: number;
  vantageScore?: number;
  dtiPercent: number;
  totalMonthlyObligations: number;
  openAutoTradelines: number;
  derogatoryMarks: number;
  hasRepo: boolean;
  hasBankruptcy: boolean;
}

// Lender
export interface Lender {
  id: string;
  name: string;
  tier: LenderTier;
  minFicoScore: number;
  maxLtvPercent: number;
  maxDtiPercent: number;
  maxPtiPercent: number;
  maxLoanAmount: number;
  minLoanAmount: number;
  acceptsPrivateParty: boolean;
  acceptsItin: boolean;
  statesActive: string[];
  referralFee: number;
  isActive: boolean;
}
