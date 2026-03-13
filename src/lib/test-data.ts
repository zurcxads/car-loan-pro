import type {
  BorrowerPersonalInfo,
  AddressInfo,
  EmploymentInfo,
  VehicleInfo,
  DealStructure,
  ConsentInfo,
  LenderOffer,
  CreditPullResult,
} from './types';

// Test Consumer Data
export const TEST_PERSONAL_INFO: BorrowerPersonalInfo = {
  firstName: 'Maria',
  middleName: 'Elena',
  lastName: 'Rodriguez',
  suffix: '',
  ssn: '123-45-6789',
  dob: '1988-05-15',
  driversLicenseNumber: 'TX12345678',
  driversLicenseState: 'TX',
  email: 'maria.rodriguez.test@autoloanpro.co',
  phone: '(713) 555-0142',
  preferredLanguage: 'english',
};

export const TEST_ADDRESS_INFO: AddressInfo = {
  currentAddressLine1: '4521 Oak Street',
  currentAddressLine2: 'Apt 2B',
  currentCity: 'Houston',
  currentState: 'TX',
  currentZip: '77001',
  residenceType: 'rent',
  monthlyHousingPayment: 1450,
  monthsAtCurrentAddress: 36,
};

export const TEST_EMPLOYMENT_INFO: EmploymentInfo = {
  employmentStatus: 'full_time',
  employerName: 'HEB Grocery Company',
  employerAddress: '646 S Main Ave, San Antonio, TX 78204',
  employerPhone: '(210) 938-8000',
  jobTitle: 'Store Manager',
  monthsAtEmployer: 24,
  grossMonthlyIncome: 5800,
  incomeTypePrimary: 'employment',
  otherIncomeSource: '',
  otherIncomeMonthly: 0,
};

// Test Vehicle Data
export const TEST_VEHICLE_INFO: VehicleInfo = {
  applicationType: 'used_vehicle',
  vehicleCondition: 'used',
  year: 2023,
  make: 'Toyota',
  model: 'Camry',
  trim: 'SE',
  vin: '4T1B11HK9PU123456',
  mileage: 15000,
  askingPrice: 28500,
  isPrivateParty: false,
  dealerName: 'Houston Toyota',
  dealerZip: '77002',
};

export const TEST_DEAL_STRUCTURE: DealStructure = {
  cashDownPayment: 3000,
  hasTradeIn: false,
  desiredTermMonths: 60,
  maxMonthlyPayment: 550,
  gapInsuranceInterest: true,
  extendedWarrantyInterest: false,
};

export const TEST_CONSENT: ConsentInfo = {
  softPullConsent: true,
  hardPullConsent: true,
  tcpaConsent: true,
  termsOfService: true,
  privacyPolicy: true,
  eSignConsent: true,
};

// Test Credit Data
export const TEST_CREDIT_RESULT: CreditPullResult = {
  ficoScore: 710,
  vantageScore: 705,
  dtiPercent: 32,
  totalMonthlyObligations: 1850,
  openAutoTradelines: 1,
  derogatoryMarks: 0,
  hasRepo: false,
  hasBankruptcy: false,
};

// Test Offers
export const TEST_OFFERS: LenderOffer[] = [
  {
    id: 'offer-1',
    applicationId: 'test-app-1',
    lenderName: 'Capital One Auto',
    lenderLogo: '',
    tier: 'prime',
    status: 'approved',
    approvedAmount: 25500,
    apr: 4.49,
    termMonths: 60,
    monthlyPayment: 476,
    conditions: [],
    decisionAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'offer-2',
    applicationId: 'test-app-1',
    lenderName: 'Ally Financial',
    lenderLogo: '',
    tier: 'near_prime',
    status: 'approved',
    approvedAmount: 25500,
    apr: 6.49,
    termMonths: 60,
    monthlyPayment: 499,
    conditions: ['Proof of income required', 'Verification of employment'],
    decisionAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'offer-3',
    applicationId: 'test-app-1',
    lenderName: 'Chase Auto Finance',
    lenderLogo: '',
    tier: 'prime',
    status: 'approved',
    approvedAmount: 25500,
    apr: 4.99,
    termMonths: 72,
    monthlyPayment: 401,
    conditions: [],
    decisionAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Test Accounts
export const TEST_ACCOUNTS = {
  consumer: {
    email: 'maria.rodriguez.test@autoloanpro.co',
    password: 'AutoLoanPro2026!',
    name: 'Maria Rodriguez',
  },
  lender: {
    email: 'demo@ally.com',
    password: 'AutoLoanPro2026!',
    name: 'Ally Financial Rep',
  },
  dealer: {
    email: 'demo@dealer.com',
    password: 'AutoLoanPro2026!',
    name: 'Houston Toyota',
  },
  admin: {
    email: 'admin@autoloanpro.co',
    password: 'AutoLoanPro2026!',
    name: 'Admin User',
  },
};

// Helper to get complete test application data
export function getTestApplicationData(includeVehicle: boolean = true) {
  return {
    personalInfo: TEST_PERSONAL_INFO,
    addressInfo: TEST_ADDRESS_INFO,
    employmentInfo: TEST_EMPLOYMENT_INFO,
    vehicleInfo: includeVehicle ? TEST_VEHICLE_INFO : undefined,
    dealStructure: TEST_DEAL_STRUCTURE,
    consent: TEST_CONSENT,
    hasCoBorrower: false,
  };
}

// Variation: Lower credit score
export const TEST_SUBPRIME_CREDIT: CreditPullResult = {
  ficoScore: 580,
  vantageScore: 575,
  dtiPercent: 42,
  totalMonthlyObligations: 2450,
  openAutoTradelines: 2,
  derogatoryMarks: 1,
  hasRepo: false,
  hasBankruptcy: false,
};

// Variation: High credit score
export const TEST_PRIME_CREDIT: CreditPullResult = {
  ficoScore: 780,
  vantageScore: 785,
  dtiPercent: 22,
  totalMonthlyObligations: 1280,
  openAutoTradelines: 1,
  derogatoryMarks: 0,
  hasRepo: false,
  hasBankruptcy: false,
};
