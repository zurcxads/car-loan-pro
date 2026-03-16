// Core types based on PRD database schema

export type UserRole = 'consumer' | 'dealer' | 'lender' | 'admin';
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'offers_ready'
  | 'offer_accepted'
  | 'documents_requested'
  | 'under_review'
  | 'approved'
  | 'funded'
  | 'expired'
  | 'declined'
  | 'cancelled';
export type ApplicationType = 'new_vehicle' | 'used_vehicle' | 'refinance' | 'private_party';
export type VehicleCondition = 'new' | 'used' | 'certified_pre_owned';
export type ResidenceType = 'own' | 'rent' | 'other';
export type EmploymentStatus = 'full_time' | 'part_time' | 'self_employed' | 'retired' | 'other';
export type IncomeType = 'employment' | 'self_employed' | 'retirement' | 'disability' | 'ssi' | 'child_support' | 'other';
export type LenderTier = 'prime' | 'near_prime' | 'subprime' | 'specialty';
export type OfferStatus = 'pending' | 'available' | 'approved' | 'conditional' | 'declined' | 'expired' | 'selected' | 'locked';
export type CreditPullType = 'soft' | 'hard';
export type DocumentRequestType =
  | 'pay_stub'
  | 'drivers_license'
  | 'bank_statement'
  | 'proof_of_residence'
  | 'proof_of_insurance'
  | 'tax_return'
  | 'income_verification'
  | 'other';
export type DocumentRequestStatus = 'pending' | 'uploaded' | 'reviewed' | 'approved' | 'rejected';
export type MessageSenderRole = 'consumer' | 'lender' | 'admin';
export type ApplicationNotificationType = 'documents_uploaded';
export type ApplicationMetadataActorRole = MessageSenderRole | 'system';

export interface ApplicationMetadataMessage {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole: ApplicationMetadataActorRole;
  createdAt: string;
  message: string;
}

export interface ApplicationMetadataTimelineEntry {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole: ApplicationMetadataActorRole;
  createdAt: string;
  details?: Record<string, unknown>;
  type: 'lender_approved' | 'lender_declined' | 'lender_countered' | 'consumer_document_uploaded';
}

export interface ApplicationNotification {
  id: string;
  type: ApplicationNotificationType;
  applicationId: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
}

export interface ApplicationMetadata {
  counterOffer?: {
    terms: Record<string, unknown>;
    updatedAt: string;
  };
  messages?: ApplicationMetadataMessage[];
  notifications?: ApplicationNotification[];
  timeline?: ApplicationMetadataTimelineEntry[];
}

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
  documentRequests?: DocumentRequest[];
  messages?: Message[];
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

export interface UploadedDocument {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  storagePath?: string;
  publicUrl?: string;
  uploadPending?: boolean;
}

export interface DocumentRequest {
  id: string;
  applicationId: string;
  type: DocumentRequestType;
  status: DocumentRequestStatus;
  requestedAt: string;
  deadline?: string;
  uploadedAt?: string;
  notes?: string;
  document?: UploadedDocument;
}

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  createdAt: string;
  readAt?: string;
}
