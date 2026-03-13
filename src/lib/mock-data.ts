// Central mock data store — all applications, offers, lenders, dealers
// Matches PRD Section 2 exactly

export type MockAppStatus = 'pending_decision' | 'offers_available' | 'conditional' | 'funded' | 'declined';
export type MockOfferStatus = 'approved' | 'conditional' | 'declined' | 'selected';
export type LenderTierType = 'prime' | 'near_prime' | 'subprime';

export interface MockApplication {
  id: string;
  borrower: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssn: string;
    dob: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    residenceType: string;
    monthlyHousingPayment: number;
    monthsAtAddress: number;
  };
  employment: {
    status: string;
    employer: string;
    title: string;
    monthsAtEmployer: number;
    grossMonthlyIncome: number;
    incomeType: string;
  };
  credit: {
    ficoScore: number | null;
    scoreTier: string;
    totalMonthlyObligations: number;
    openAutoTradelines: number;
    derogatoryMarks: number;
    hasRepo: boolean;
    hasBankruptcy: boolean;
  };
  vehicle?: {
    year: number;
    make: string;
    model: string;
    trim: string;
    vin: string;
    mileage: number;
    condition: string;
    bookValue: number;
    askingPrice: number;
    dealerName: string;
  };
  dealStructure: {
    salePrice?: number;
    downPayment?: number;
    tradeInValue?: number;
    tradeInPayoff?: number;
    docFee?: number;
    taxAndFees?: number;
    totalAmountFinanced?: number;
    requestedTerm: number;
  };
  loanAmount?: number;
  ltvPercent?: number;
  dtiPercent: number;
  ptiPercent?: number;
  hasVehicle: boolean;
  status: MockAppStatus;
  state: string;
  submittedAt: string;
  updatedAt: string;
  lendersSubmitted: number;
  offersReceived: number;
  flags: string[];
}

export interface MockOffer {
  id: string;
  applicationId: string;
  lenderId: string;
  lenderName: string;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  approvedAmount: number;
  maxApprovedAmount?: number; // For no-vehicle pre-approvals
  status: MockOfferStatus;
  conditions: string[];
  decisionAt: string;
  expiresAt: string;
}

export interface MockLender {
  id: string;
  name: string;
  tier: LenderTierType;
  minFico: number;
  maxLtv: number;
  maxDti: number;
  maxPti: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  maxVehicleAge: number;
  maxMileage: number;
  acceptsCPO: boolean;
  acceptsPrivateParty: boolean;
  acceptsITIN: boolean;
  statesActive: string[];
  referralFee: number;
  isActive: boolean;
  integrationStatus: string;
  avgDecisionTimeMinutes: number;
  appsReceivedMTD: number;
  approvalRate: number;
  totalFundedVolume: number;
  totalReferralFeesOwed: number;
  lastActivity: string;
  rateTiers: { ficoMin: number; ficoMax: number; rateMin: number; rateMax: number }[];
}

export interface MockDealer {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  phone: string;
  website: string;
  contactEmail: string;
  franchiseBrands: string[];
  buyersSentMTD: number;
  dealsFundedMTD: number;
  plan: string;
  planPrice: number;
  billingDate: string;
  status: string;
  joinedDate: string;
  teamMembers: { name: string; email: string; role: string; status: string; addedDate: string }[];
}

export interface MockDeal {
  id: string;
  applicationId: string;
  dealerId: string;
  buyerFirstName: string;
  buyerLastInitial: string;
  vehicle: string;
  vin: string;
  lenderName: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  status: 'submitted' | 'lender_review' | 'approved_for_funding' | 'wire_sent' | 'funded' | 'declined';
  daysOpen: number;
  dealerNet: number;
  submittedAt: string;
  fundedAt?: string;
  events: { timestamp: string; event: string }[];
}

export interface ActivityEvent {
  id: string;
  type: 'application' | 'funded' | 'offer' | 'declined' | 'system';
  timestamp: string;
  description: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  action: string;
  resolved: boolean;
}

// --- MOCK APPLICATIONS (10 records per PRD Section 2.1) ---
export const MOCK_APPLICATIONS: MockApplication[] = [
  {
    id: 'APP-001',
    borrower: { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@email.com', phone: '(713) 555-0142', ssn: '***-**-4521', dob: '1988-04-15', address: '4521 Elm Street', city: 'Houston', state: 'TX', zip: '77001', residenceType: 'own', monthlyHousingPayment: 1450, monthsAtAddress: 36 },
    employment: { status: 'full_time', employer: 'Texas Medical Center', title: 'IT Specialist', monthsAtEmployer: 48, grossMonthlyIncome: 6200, incomeType: 'employment' },
    credit: { ficoScore: 742, scoreTier: 'prime', totalMonthlyObligations: 1984, openAutoTradelines: 1, derogatoryMarks: 0, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2022, make: 'Toyota', model: 'Camry', trim: 'SE', vin: '4T1BF1FK0NU123456', mileage: 28000, condition: 'used', bookValue: 29000, askingPrice: 29000, dealerName: 'AutoMax Houston' },
    dealStructure: { salePrice: 29000, downPayment: 2500, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 1800, totalAmountFinanced: 28500, requestedTerm: 60 },
    loanAmount: 28500, ltvPercent: 98, dtiPercent: 32, ptiPercent: 14, hasVehicle: true, status: 'offers_available', state: 'TX',
    submittedAt: '2026-03-07T14:30:00Z', updatedAt: '2026-03-07T15:00:00Z', lendersSubmitted: 4, offersReceived: 3, flags: [],
  },
  {
    id: 'APP-002',
    borrower: { firstName: 'Diana', lastName: 'Cruz', email: 'diana.cruz@email.com', phone: '(305) 555-0198', ssn: '***-**-7832', dob: '1992-08-22', address: '982 Palm Ave', city: 'Miami', state: 'FL', zip: '33101', residenceType: 'rent', monthlyHousingPayment: 1800, monthsAtAddress: 18 },
    employment: { status: 'full_time', employer: 'Baptist Health', title: 'Registered Nurse', monthsAtEmployer: 30, grossMonthlyIncome: 5400, incomeType: 'employment' },
    credit: { ficoScore: 681, scoreTier: 'near_prime', totalMonthlyObligations: 2214, openAutoTradelines: 0, derogatoryMarks: 1, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2020, make: 'Honda', model: 'Civic', trim: 'EX', vin: '2HGFC2F63LH567890', mileage: 42000, condition: 'used', bookValue: 18300, askingPrice: 19200, dealerName: 'Sunshine Nissan' },
    dealStructure: { salePrice: 19200, downPayment: 1500, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 1200, totalAmountFinanced: 19200, requestedTerm: 60 },
    loanAmount: 19200, ltvPercent: 105, dtiPercent: 41, ptiPercent: 17, hasVehicle: true, status: 'pending_decision', state: 'FL',
    submittedAt: '2026-03-08T09:15:00Z', updatedAt: '2026-03-08T09:15:00Z', lendersSubmitted: 3, offersReceived: 2, flags: [],
  },
  {
    id: 'APP-003',
    borrower: { firstName: 'Kevin', lastName: 'Park', email: 'kpark@email.com', phone: '(404) 555-0167', ssn: '***-**-3456', dob: '1985-11-03', address: '1200 Peachtree Rd', city: 'Atlanta', state: 'GA', zip: '30301', residenceType: 'rent', monthlyHousingPayment: 1350, monthsAtAddress: 24 },
    employment: { status: 'full_time', employer: 'Home Depot HQ', title: 'Warehouse Manager', monthsAtEmployer: 36, grossMonthlyIncome: 4800, incomeType: 'employment' },
    credit: { ficoScore: 598, scoreTier: 'subprime', totalMonthlyObligations: 2112, openAutoTradelines: 1, derogatoryMarks: 3, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2018, make: 'Ford', model: 'F-150', trim: 'XLT', vin: '1FTEW1EG5JFB12345', mileage: 68000, condition: 'used', bookValue: 14100, askingPrice: 15800, dealerName: 'Premier Ford Dallas' },
    dealStructure: { salePrice: 15800, downPayment: 1000, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 950, totalAmountFinanced: 15800, requestedTerm: 60 },
    loanAmount: 15800, ltvPercent: 112, dtiPercent: 44, ptiPercent: 18, hasVehicle: true, status: 'conditional', state: 'GA',
    submittedAt: '2026-03-06T11:45:00Z', updatedAt: '2026-03-07T08:30:00Z', lendersSubmitted: 3, offersReceived: 1, flags: [],
  },
  {
    id: 'APP-004',
    borrower: { firstName: 'Aaliyah', lastName: 'Thompson', email: 'aaliyah.t@email.com', phone: '(216) 555-0134', ssn: '***-**-9012', dob: '1990-06-18', address: '556 Lake Shore Blvd', city: 'Cleveland', state: 'OH', zip: '44101', residenceType: 'own', monthlyHousingPayment: 1100, monthsAtAddress: 60 },
    employment: { status: 'full_time', employer: 'Cleveland Clinic', title: 'Physical Therapist', monthsAtEmployer: 42, grossMonthlyIncome: 7200, incomeType: 'employment' },
    credit: { ficoScore: 724, scoreTier: 'prime', totalMonthlyObligations: 2088, openAutoTradelines: 0, derogatoryMarks: 0, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2023, make: 'Chevrolet', model: 'Equinox', trim: 'LT', vin: '3GNAXUEV5PL234567', mileage: 12000, condition: 'certified_pre_owned', bookValue: 35500, askingPrice: 34000, dealerName: 'AutoMax Houston' },
    dealStructure: { salePrice: 34000, downPayment: 3000, tradeInValue: 2500, tradeInPayoff: 0, docFee: 499, taxAndFees: 2100, totalAmountFinanced: 34000, requestedTerm: 60 },
    loanAmount: 34000, ltvPercent: 96, dtiPercent: 29, ptiPercent: 13, hasVehicle: true, status: 'funded', state: 'OH',
    submittedAt: '2026-02-20T16:00:00Z', updatedAt: '2026-03-05T10:00:00Z', lendersSubmitted: 4, offersReceived: 3, flags: [],
  },
  {
    id: 'APP-005',
    borrower: { firstName: 'Roberto', lastName: 'Vasquez', email: 'rvasquez@email.com', phone: '(213) 555-0156', ssn: '***-**-5678', dob: '1979-02-28', address: '3400 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90001', residenceType: 'rent', monthlyHousingPayment: 2200, monthsAtAddress: 12 },
    employment: { status: 'self_employed', employer: 'Vasquez Construction LLC', title: 'Owner', monthsAtEmployer: 60, grossMonthlyIncome: 5100, incomeType: 'self_employed' },
    credit: { ficoScore: 612, scoreTier: 'subprime', totalMonthlyObligations: 2193, openAutoTradelines: 2, derogatoryMarks: 2, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2019, make: 'Nissan', model: 'Altima', trim: 'SV', vin: '1N4BL4BV9KC345678', mileage: 55000, condition: 'used', bookValue: 20300, askingPrice: 22100, dealerName: 'Pacific Toyota' },
    dealStructure: { salePrice: 22100, downPayment: 1500, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 1400, totalAmountFinanced: 22100, requestedTerm: 60 },
    loanAmount: 22100, ltvPercent: 109, dtiPercent: 43, ptiPercent: 19, hasVehicle: true, status: 'pending_decision', state: 'CA',
    submittedAt: '2026-03-08T12:30:00Z', updatedAt: '2026-03-08T12:30:00Z', lendersSubmitted: 3, offersReceived: 0, flags: [],
  },
  {
    id: 'APP-006',
    borrower: { firstName: 'Jennifer', lastName: 'Wu', email: 'jennifer.wu@email.com', phone: '(212) 555-0189', ssn: '***-**-2345', dob: '1994-12-05', address: '88 Madison Ave Apt 4B', city: 'New York', state: 'NY', zip: '10001', residenceType: 'rent', monthlyHousingPayment: 2800, monthsAtAddress: 30 },
    employment: { status: 'full_time', employer: 'Goldman Sachs', title: 'Associate VP', monthsAtEmployer: 36, grossMonthlyIncome: 12500, incomeType: 'employment' },
    credit: { ficoScore: 758, scoreTier: 'prime', totalMonthlyObligations: 3375, openAutoTradelines: 0, derogatoryMarks: 0, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2023, make: 'BMW', model: '3 Series', trim: '330i', vin: 'WBA5R1C58PFH78901', mileage: 8000, condition: 'certified_pre_owned', bookValue: 44100, askingPrice: 41500, dealerName: 'Pacific Toyota' },
    dealStructure: { salePrice: 41500, downPayment: 5000, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 3300, totalAmountFinanced: 41500, requestedTerm: 60 },
    loanAmount: 41500, ltvPercent: 94, dtiPercent: 27, ptiPercent: 12, hasVehicle: true, status: 'offers_available', state: 'NY',
    submittedAt: '2026-03-07T10:00:00Z', updatedAt: '2026-03-07T11:30:00Z', lendersSubmitted: 5, offersReceived: 4, flags: [],
  },
  {
    id: 'APP-007',
    borrower: { firstName: 'Darnell', lastName: 'Foster', email: 'dfoster@email.com', phone: '(832) 555-0111', ssn: '***-**-8901', dob: '1982-07-10', address: '2100 Main St Apt 12', city: 'Houston', state: 'TX', zip: '77002', residenceType: 'rent', monthlyHousingPayment: 950, monthsAtAddress: 6 },
    employment: { status: 'part_time', employer: 'Amazon Warehouse', title: 'Associate', monthsAtEmployer: 8, grossMonthlyIncome: 2800, incomeType: 'employment' },
    credit: { ficoScore: 555, scoreTier: 'subprime', totalMonthlyObligations: 1456, openAutoTradelines: 1, derogatoryMarks: 5, hasRepo: true, hasBankruptcy: false },
    vehicle: { year: 2016, make: 'Hyundai', model: 'Elantra', trim: 'SE', vin: '5NPD84LF2GH456789', mileage: 95000, condition: 'used', bookValue: 10100, askingPrice: 11900, dealerName: 'AutoMax Houston' },
    dealStructure: { salePrice: 11900, downPayment: 500, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 750, totalAmountFinanced: 11900, requestedTerm: 60 },
    loanAmount: 11900, ltvPercent: 118, dtiPercent: 52, ptiPercent: 22, hasVehicle: true, status: 'declined', state: 'TX',
    submittedAt: '2026-03-08T08:00:00Z', updatedAt: '2026-03-08T09:00:00Z', lendersSubmitted: 2, offersReceived: 0, flags: ['high_dti', 'repo_history'],
  },
  {
    id: 'APP-008',
    borrower: { firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@email.com', phone: '(206) 555-0178', ssn: '***-**-6789', dob: '1991-03-25', address: '4400 Pine St', city: 'Seattle', state: 'WA', zip: '98101', residenceType: 'own', monthlyHousingPayment: 1900, monthsAtAddress: 48 },
    employment: { status: 'full_time', employer: 'Microsoft', title: 'Software Engineer', monthsAtEmployer: 24, grossMonthlyIncome: 9500, incomeType: 'employment' },
    credit: { ficoScore: 693, scoreTier: 'near_prime', totalMonthlyObligations: 3610, openAutoTradelines: 1, derogatoryMarks: 1, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2021, make: 'Subaru', model: 'Outback', trim: 'Premium', vin: '4S4BTACC3M3123456', mileage: 35000, condition: 'used', bookValue: 25900, askingPrice: 26700, dealerName: 'Premier Ford Dallas' },
    dealStructure: { salePrice: 26700, downPayment: 2000, tradeInValue: 3500, tradeInPayoff: 1200, docFee: 499, taxAndFees: 1700, totalAmountFinanced: 26700, requestedTerm: 60 },
    loanAmount: 26700, ltvPercent: 103, dtiPercent: 38, ptiPercent: 16, hasVehicle: true, status: 'conditional', state: 'WA',
    submittedAt: '2026-03-06T15:20:00Z', updatedAt: '2026-03-07T14:00:00Z', lendersSubmitted: 4, offersReceived: 2, flags: [],
  },
  {
    id: 'APP-009',
    borrower: { firstName: 'Miguel', lastName: 'Santos', email: 'miguel.s@email.com', phone: '(210) 555-0145', ssn: 'ITIN', dob: '1986-09-12', address: '780 Commerce St', city: 'San Antonio', state: 'TX', zip: '78201', residenceType: 'rent', monthlyHousingPayment: 1100, monthsAtAddress: 24 },
    employment: { status: 'full_time', employer: 'Santos Landscaping', title: 'Foreman', monthsAtEmployer: 36, grossMonthlyIncome: 4600, incomeType: 'employment' },
    credit: { ficoScore: null, scoreTier: 'itin', totalMonthlyObligations: 1840, openAutoTradelines: 0, derogatoryMarks: 0, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2019, make: 'Toyota', model: 'RAV4', trim: 'LE', vin: '2T3F1RFV5KW789012', mileage: 48000, condition: 'used', bookValue: 16300, askingPrice: 17400, dealerName: 'AutoMax Houston' },
    dealStructure: { salePrice: 17400, downPayment: 2000, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 1100, totalAmountFinanced: 17400, requestedTerm: 60 },
    loanAmount: 17400, ltvPercent: 107, dtiPercent: 40, ptiPercent: 17, hasVehicle: true, status: 'pending_decision', state: 'TX',
    submittedAt: '2026-03-08T14:45:00Z', updatedAt: '2026-03-08T14:45:00Z', lendersSubmitted: 2, offersReceived: 0, flags: ['itin_borrower'],
  },
  {
    id: 'APP-010',
    borrower: { firstName: 'Tamika', lastName: 'Williams', email: 'tamika.w@email.com', phone: '(704) 555-0123', ssn: '***-**-0123', dob: '1987-01-30', address: '1500 Trade St', city: 'Charlotte', state: 'NC', zip: '28201', residenceType: 'own', monthlyHousingPayment: 1250, monthsAtAddress: 72 },
    employment: { status: 'full_time', employer: 'Bank of America', title: 'Branch Manager', monthsAtEmployer: 54, grossMonthlyIncome: 5800, incomeType: 'employment' },
    credit: { ficoScore: 637, scoreTier: 'near_prime', totalMonthlyObligations: 2088, openAutoTradelines: 1, derogatoryMarks: 2, hasRepo: false, hasBankruptcy: false },
    vehicle: { year: 2020, make: 'Kia', model: 'Sorento', trim: 'LX', vin: '5XYPG4A56LG345678', mileage: 51000, condition: 'used', bookValue: 20000, askingPrice: 20800, dealerName: 'Sunshine Nissan' },
    dealStructure: { salePrice: 20800, downPayment: 1500, tradeInValue: 0, tradeInPayoff: 0, docFee: 499, taxAndFees: 1300, totalAmountFinanced: 20800, requestedTerm: 60 },
    loanAmount: 20800, ltvPercent: 104, dtiPercent: 36, ptiPercent: 15, hasVehicle: true, status: 'funded', state: 'NC',
    submittedAt: '2026-02-25T10:00:00Z', updatedAt: '2026-03-06T16:00:00Z', lendersSubmitted: 3, offersReceived: 2, flags: [],
  },
];

// --- MOCK OFFERS (9 records per PRD Section 2.2) ---
export const MOCK_OFFERS: MockOffer[] = [
  { id: 'OFR-001', applicationId: 'APP-001', lenderId: 'LND-001', lenderName: 'Ally Financial', apr: 4.49, termMonths: 60, monthlyPayment: 529, approvedAmount: 28500, status: 'approved', conditions: ['Proof of income'], decisionAt: '2026-03-07T15:00:00Z', expiresAt: '2026-04-06T15:00:00Z' },
  { id: 'OFR-002', applicationId: 'APP-001', lenderId: 'LND-002', lenderName: 'Capital One Auto', apr: 4.89, termMonths: 60, monthlyPayment: 536, approvedAmount: 28500, status: 'approved', conditions: [], decisionAt: '2026-03-07T15:05:00Z', expiresAt: '2026-04-06T15:05:00Z' },
  { id: 'OFR-003', applicationId: 'APP-001', lenderId: 'LND-006', lenderName: 'TD Auto Finance', apr: 5.19, termMonths: 60, monthlyPayment: 543, approvedAmount: 27000, status: 'approved', conditions: ['Full coverage insurance'], decisionAt: '2026-03-07T15:10:00Z', expiresAt: '2026-04-06T15:10:00Z' },
  { id: 'OFR-004', applicationId: 'APP-002', lenderId: 'LND-004', lenderName: 'Westlake Financial', apr: 7.99, termMonths: 60, monthlyPayment: 388, approvedAmount: 19200, status: 'approved', conditions: ['Proof of income', 'Proof of insurance'], decisionAt: '2026-03-08T10:00:00Z', expiresAt: '2026-04-07T10:00:00Z' },
  { id: 'OFR-005', applicationId: 'APP-002', lenderId: 'LND-005', lenderName: 'Prestige Financial', apr: 8.49, termMonths: 60, monthlyPayment: 396, approvedAmount: 18500, status: 'conditional', conditions: ['2 recent paystubs'], decisionAt: '2026-03-08T10:30:00Z', expiresAt: '2026-04-07T10:30:00Z' },
  { id: 'OFR-006', applicationId: 'APP-006', lenderId: 'LND-003', lenderName: 'Chase Auto', apr: 3.89, termMonths: 60, monthlyPayment: 761, approvedAmount: 41500, status: 'approved', conditions: [], decisionAt: '2026-03-07T11:00:00Z', expiresAt: '2026-04-06T11:00:00Z' },
  { id: 'OFR-007', applicationId: 'APP-006', lenderId: 'LND-002', lenderName: 'Bank of America', apr: 3.99, termMonths: 60, monthlyPayment: 763, approvedAmount: 41500, status: 'approved', conditions: ['Proof of insurance'], decisionAt: '2026-03-07T11:15:00Z', expiresAt: '2026-04-06T11:15:00Z' },
  { id: 'OFR-008', applicationId: 'APP-006', lenderId: 'LND-002', lenderName: 'Capital One Auto', apr: 4.29, termMonths: 60, monthlyPayment: 769, approvedAmount: 40000, status: 'approved', conditions: [], decisionAt: '2026-03-07T11:20:00Z', expiresAt: '2026-04-06T11:20:00Z' },
  { id: 'OFR-009', applicationId: 'APP-006', lenderId: 'LND-001', lenderName: 'Ally Financial', apr: 4.49, termMonths: 72, monthlyPayment: 664, approvedAmount: 41500, status: 'approved', conditions: [], decisionAt: '2026-03-07T11:25:00Z', expiresAt: '2026-04-06T11:25:00Z' },
];

// --- MOCK LENDERS (6 records per PRD Section 2.3) ---
export const MOCK_LENDERS: MockLender[] = [
  {
    id: 'LND-001', name: 'Ally Financial', tier: 'near_prime', minFico: 620, maxLtv: 120, maxDti: 48, maxPti: 22,
    minLoanAmount: 5000, maxLoanAmount: 75000, maxVehicleAge: 10, maxMileage: 120000,
    acceptsCPO: true, acceptsPrivateParty: true, acceptsITIN: false,
    statesActive: ['All 50'], referralFee: 300, isActive: true, integrationStatus: 'API',
    avgDecisionTimeMinutes: 15, appsReceivedMTD: 45, approvalRate: 68, totalFundedVolume: 1250000, totalReferralFeesOwed: 13500, lastActivity: '2026-03-09T04:30:00Z',
    rateTiers: [{ ficoMin: 720, ficoMax: 850, rateMin: 3.5, rateMax: 4.5 }, { ficoMin: 660, ficoMax: 719, rateMin: 5.0, rateMax: 6.5 }, { ficoMin: 620, ficoMax: 659, rateMin: 7.0, rateMax: 9.0 }],
  },
  {
    id: 'LND-002', name: 'Capital One Auto', tier: 'prime', minFico: 660, maxLtv: 110, maxDti: 42, maxPti: 18,
    minLoanAmount: 8000, maxLoanAmount: 100000, maxVehicleAge: 8, maxMileage: 100000,
    acceptsCPO: true, acceptsPrivateParty: false, acceptsITIN: false,
    statesActive: ['All 50'], referralFee: 250, isActive: true, integrationStatus: 'API',
    avgDecisionTimeMinutes: 8, appsReceivedMTD: 62, approvalRate: 72, totalFundedVolume: 2100000, totalReferralFeesOwed: 15500, lastActivity: '2026-03-09T03:45:00Z',
    rateTiers: [{ ficoMin: 720, ficoMax: 850, rateMin: 3.0, rateMax: 4.0 }, { ficoMin: 660, ficoMax: 719, rateMin: 4.5, rateMax: 5.5 }],
  },
  {
    id: 'LND-003', name: 'Chase Auto', tier: 'prime', minFico: 680, maxLtv: 108, maxDti: 40, maxPti: 16,
    minLoanAmount: 10000, maxLoanAmount: 150000, maxVehicleAge: 7, maxMileage: 80000,
    acceptsCPO: true, acceptsPrivateParty: false, acceptsITIN: false,
    statesActive: ['All 50'], referralFee: 275, isActive: true, integrationStatus: 'API',
    avgDecisionTimeMinutes: 12, appsReceivedMTD: 38, approvalRate: 75, totalFundedVolume: 1800000, totalReferralFeesOwed: 10450, lastActivity: '2026-03-09T02:15:00Z',
    rateTiers: [{ ficoMin: 720, ficoMax: 850, rateMin: 2.9, rateMax: 3.9 }, { ficoMin: 680, ficoMax: 719, rateMin: 4.0, rateMax: 5.0 }],
  },
  {
    id: 'LND-004', name: 'Westlake Financial', tier: 'subprime', minFico: 520, maxLtv: 130, maxDti: 52, maxPti: 25,
    minLoanAmount: 3000, maxLoanAmount: 50000, maxVehicleAge: 12, maxMileage: 150000,
    acceptsCPO: true, acceptsPrivateParty: true, acceptsITIN: true,
    statesActive: ['All 50'], referralFee: 400, isActive: true, integrationStatus: 'API',
    avgDecisionTimeMinutes: 20, appsReceivedMTD: 78, approvalRate: 55, totalFundedVolume: 980000, totalReferralFeesOwed: 31200, lastActivity: '2026-03-09T04:50:00Z',
    rateTiers: [{ ficoMin: 620, ficoMax: 719, rateMin: 6.0, rateMax: 8.0 }, { ficoMin: 520, ficoMax: 619, rateMin: 8.0, rateMax: 14.0 }],
  },
  {
    id: 'LND-005', name: 'Prestige Financial', tier: 'subprime', minFico: 500, maxLtv: 128, maxDti: 50, maxPti: 24,
    minLoanAmount: 3000, maxLoanAmount: 40000, maxVehicleAge: 12, maxMileage: 140000,
    acceptsCPO: true, acceptsPrivateParty: true, acceptsITIN: true,
    statesActive: ['All 50'], referralFee: 380, isActive: true, integrationStatus: 'Manual',
    avgDecisionTimeMinutes: 45, appsReceivedMTD: 52, approvalRate: 48, totalFundedVolume: 620000, totalReferralFeesOwed: 19760, lastActivity: '2026-03-08T22:00:00Z',
    rateTiers: [{ ficoMin: 600, ficoMax: 719, rateMin: 7.0, rateMax: 10.0 }, { ficoMin: 500, ficoMax: 599, rateMin: 10.0, rateMax: 16.0 }],
  },
  {
    id: 'LND-006', name: 'TD Auto Finance', tier: 'near_prime', minFico: 630, maxLtv: 118, maxDti: 46, maxPti: 20,
    minLoanAmount: 5000, maxLoanAmount: 80000, maxVehicleAge: 10, maxMileage: 110000,
    acceptsCPO: true, acceptsPrivateParty: false, acceptsITIN: false,
    statesActive: ['All 50'], referralFee: 290, isActive: true, integrationStatus: 'API',
    avgDecisionTimeMinutes: 18, appsReceivedMTD: 35, approvalRate: 62, totalFundedVolume: 890000, totalReferralFeesOwed: 10150, lastActivity: '2026-03-09T01:30:00Z',
    rateTiers: [{ ficoMin: 720, ficoMax: 850, rateMin: 3.8, rateMax: 4.8 }, { ficoMin: 660, ficoMax: 719, rateMin: 5.0, rateMax: 6.5 }, { ficoMin: 630, ficoMax: 659, rateMin: 6.5, rateMax: 8.5 }],
  },
];

// --- MOCK DEALERS (4 records per PRD Section 2.4) ---
export const MOCK_DEALERS: MockDealer[] = [
  {
    id: 'DLR-001', name: 'AutoMax Houston', city: 'Houston', state: 'TX', address: '8500 Southwest Freeway', zip: '77074', phone: '(713) 555-0100', website: 'automaxhouston.com', contactEmail: 'sales@automaxhou.com',
    franchiseBrands: ['Toyota', 'Honda', 'Nissan'], buyersSentMTD: 14, dealsFundedMTD: 8, plan: 'Pro', planPrice: 499, billingDate: '2026-03-15', status: 'active', joinedDate: '2025-06-01',
    teamMembers: [
      { name: 'Carlos Rivera', email: 'carlos@automaxhou.com', role: 'Sales Manager', status: 'active', addedDate: '2025-06-01' },
      { name: 'Lisa Chen', email: 'lisa@automaxhou.com', role: 'F&I Manager', status: 'active', addedDate: '2025-06-15' },
      { name: 'Marcus Webb', email: 'marcus@automaxhou.com', role: 'Internet Sales', status: 'active', addedDate: '2025-08-01' },
    ],
  },
  {
    id: 'DLR-002', name: 'Premier Ford Dallas', city: 'Dallas', state: 'TX', address: '2200 N Stemmons Freeway', zip: '75207', phone: '(214) 555-0200', website: 'premierford.com', contactEmail: 'finance@premierford.com',
    franchiseBrands: ['Ford', 'Lincoln'], buyersSentMTD: 9, dealsFundedMTD: 5, plan: 'Starter', planPrice: 299, billingDate: '2026-03-20', status: 'active', joinedDate: '2025-09-15',
    teamMembers: [
      { name: 'David Park', email: 'david@premierford.com', role: 'F&I Manager', status: 'active', addedDate: '2025-09-15' },
      { name: 'Sarah Lee', email: 'sarah@premierford.com', role: 'Internet Sales', status: 'active', addedDate: '2025-10-01' },
    ],
  },
  {
    id: 'DLR-003', name: 'Sunshine Nissan', city: 'Miami', state: 'FL', address: '4400 NW 36th St', zip: '33166', phone: '(305) 555-0300', website: 'sunshinenissan.com', contactEmail: 'internet@sunshinenissan.com',
    franchiseBrands: ['Nissan'], buyersSentMTD: 7, dealsFundedMTD: 3, plan: 'Pro', planPrice: 499, billingDate: '2026-03-10', status: 'active', joinedDate: '2025-11-01',
    teamMembers: [
      { name: 'Ana Martinez', email: 'ana@sunshinenissan.com', role: 'Sales Manager', status: 'active', addedDate: '2025-11-01' },
    ],
  },
  {
    id: 'DLR-004', name: 'Pacific Toyota', city: 'Los Angeles', state: 'CA', address: '1200 S Figueroa St', zip: '90015', phone: '(213) 555-0400', website: 'pacifictoyota.com', contactEmail: 'fleet@pacifictoyota.com',
    franchiseBrands: ['Toyota', 'Lexus'], buyersSentMTD: 11, dealsFundedMTD: 6, plan: 'Enterprise', planPrice: 999, billingDate: '2026-03-01', status: 'active', joinedDate: '2025-04-01',
    teamMembers: [
      { name: 'James Tanaka', email: 'james@pacifictoyota.com', role: 'Sales Manager', status: 'active', addedDate: '2025-04-01' },
      { name: 'Michelle Park', email: 'michelle@pacifictoyota.com', role: 'F&I Manager', status: 'active', addedDate: '2025-04-15' },
      { name: 'Ryan Brooks', email: 'ryan@pacifictoyota.com', role: 'Internet Sales', status: 'active', addedDate: '2025-05-01' },
      { name: 'Jessica Liu', email: 'jessica@pacifictoyota.com', role: 'Admin', status: 'active', addedDate: '2025-06-01' },
    ],
  },
];

// --- MOCK DEALS ---
export const MOCK_DEALS: MockDeal[] = [
  {
    id: 'DEAL-001', applicationId: 'APP-004', dealerId: 'DLR-001', buyerFirstName: 'Aaliyah', buyerLastInitial: 'T', vehicle: '2023 Chevrolet Equinox LT', vin: '3GNAXUEV5PL234567',
    lenderName: 'Ally Financial', amount: 34000, rate: 4.49, term: 60, monthlyPayment: 631, status: 'funded', daysOpen: 12, dealerNet: 28500,
    submittedAt: '2026-02-22T10:00:00Z', fundedAt: '2026-03-05T10:00:00Z',
    events: [
      { timestamp: '2026-02-22T10:00:00Z', event: 'Deal submitted to Ally Financial' },
      { timestamp: '2026-02-22T14:00:00Z', event: 'Lender review started' },
      { timestamp: '2026-02-24T09:00:00Z', event: 'Approved for funding' },
      { timestamp: '2026-03-03T11:00:00Z', event: 'Wire sent to dealership' },
      { timestamp: '2026-03-05T10:00:00Z', event: 'Deal funded - completed' },
    ],
  },
  {
    id: 'DEAL-002', applicationId: 'APP-010', dealerId: 'DLR-003', buyerFirstName: 'Tamika', buyerLastInitial: 'W', vehicle: '2020 Kia Sorento LX', vin: '5XYPG4A56LG345678',
    lenderName: 'Westlake Financial', amount: 20800, rate: 8.49, term: 60, monthlyPayment: 422, status: 'funded', daysOpen: 8, dealerNet: 19300,
    submittedAt: '2026-02-26T14:00:00Z', fundedAt: '2026-03-06T16:00:00Z',
    events: [
      { timestamp: '2026-02-26T14:00:00Z', event: 'Deal submitted to Westlake Financial' },
      { timestamp: '2026-02-27T10:00:00Z', event: 'Lender review started' },
      { timestamp: '2026-03-01T15:00:00Z', event: 'Approved for funding' },
      { timestamp: '2026-03-05T09:00:00Z', event: 'Wire sent to dealership' },
      { timestamp: '2026-03-06T16:00:00Z', event: 'Deal funded - completed' },
    ],
  },
  {
    id: 'DEAL-003', applicationId: 'APP-001', dealerId: 'DLR-001', buyerFirstName: 'Marcus', buyerLastInitial: 'J', vehicle: '2022 Toyota Camry SE', vin: '4T1BF1FK0NU123456',
    lenderName: 'Capital One Auto', amount: 28500, rate: 4.89, term: 60, monthlyPayment: 536, status: 'lender_review', daysOpen: 2, dealerNet: 0,
    submittedAt: '2026-03-07T16:00:00Z',
    events: [
      { timestamp: '2026-03-07T16:00:00Z', event: 'Deal submitted to Capital One Auto' },
      { timestamp: '2026-03-08T09:00:00Z', event: 'Lender review started' },
    ],
  },
  {
    id: 'DEAL-004', applicationId: 'APP-006', dealerId: 'DLR-004', buyerFirstName: 'Jennifer', buyerLastInitial: 'W', vehicle: '2023 BMW 3 Series 330i', vin: 'WBA5R1C58PFH78901',
    lenderName: 'Chase Auto', amount: 41500, rate: 3.89, term: 60, monthlyPayment: 761, status: 'approved_for_funding', daysOpen: 3, dealerNet: 0,
    submittedAt: '2026-03-06T12:00:00Z',
    events: [
      { timestamp: '2026-03-06T12:00:00Z', event: 'Deal submitted to Chase Auto' },
      { timestamp: '2026-03-06T16:00:00Z', event: 'Lender review started' },
      { timestamp: '2026-03-08T10:00:00Z', event: 'Approved for funding - awaiting wire' },
    ],
  },
];

// --- ACTIVITY EVENTS ---
export const MOCK_ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 'EVT-001', type: 'application', timestamp: '2026-03-09T04:50:00Z', description: 'APP-009: Miguel Santos submitted application' },
  { id: 'EVT-002', type: 'offer', timestamp: '2026-03-09T04:30:00Z', description: 'OFR-006: Chase Auto sent offer to APP-006 at 3.89% APR' },
  { id: 'EVT-003', type: 'declined', timestamp: '2026-03-09T04:00:00Z', description: 'APP-007: Declined - Score below minimum (555 FICO)' },
  { id: 'EVT-004', type: 'funded', timestamp: '2026-03-08T16:00:00Z', description: 'APP-010: Westlake Financial funded $20,800 loan' },
  { id: 'EVT-005', type: 'application', timestamp: '2026-03-08T14:45:00Z', description: 'APP-005: Roberto Vasquez submitted application' },
  { id: 'EVT-006', type: 'offer', timestamp: '2026-03-08T10:30:00Z', description: 'OFR-005: Prestige Financial conditional offer to APP-002' },
  { id: 'EVT-007', type: 'offer', timestamp: '2026-03-08T10:00:00Z', description: 'OFR-004: Westlake Financial approved APP-002 at 7.99%' },
  { id: 'EVT-008', type: 'application', timestamp: '2026-03-08T09:15:00Z', description: 'APP-002: Diana Cruz submitted application' },
  { id: 'EVT-009', type: 'funded', timestamp: '2026-03-05T10:00:00Z', description: 'APP-004: Ally Financial funded $34,000 loan for Aaliyah Thompson' },
  { id: 'EVT-010', type: 'system', timestamp: '2026-03-07T00:00:00Z', description: 'System: Daily credit pull batch completed - 8 applications processed' },
];

// --- COMPLIANCE ALERTS ---
export const MOCK_COMPLIANCE_ALERTS: ComplianceAlert[] = [
  { id: 'ALT-001', type: 'error', message: 'Failed credit pull for APP-009 (ITIN borrower) - bureau timeout', timestamp: '2026-03-08T15:00:00Z', action: 'Retry', resolved: false },
  { id: 'ALT-002', type: 'warning', message: 'Adverse action notice deadline in 5 days for APP-007', timestamp: '2026-03-08T09:00:00Z', action: 'View', resolved: false },
  { id: 'ALT-003', type: 'info', message: 'New lender signup: Pacific Credit Union - pending approval', timestamp: '2026-03-07T14:00:00Z', action: 'Review', resolved: false },
  { id: 'ALT-004', type: 'warning', message: 'Lender API timeout: Prestige Financial (3 occurrences today)', timestamp: '2026-03-08T11:00:00Z', action: 'View', resolved: false },
  { id: 'ALT-005', type: 'success', message: 'Revenue milestone: $100K total referral fees collected', timestamp: '2026-03-06T10:00:00Z', action: 'Dismiss', resolved: true },
];

// Helper to get offers for a specific application
export function getOffersForApplication(appId: string): MockOffer[] {
  return MOCK_OFFERS.filter(o => o.applicationId === appId);
}

// Helper to get application by ID
export function getApplicationById(appId: string): MockApplication | undefined {
  return MOCK_APPLICATIONS.find(a => a.id === appId);
}

// Helper to get lender by ID
export function getLenderById(lenderId: string): MockLender | undefined {
  return MOCK_LENDERS.find(l => l.id === lenderId);
}

// Helper to get dealer by ID
export function getDealerById(dealerId: string): MockDealer | undefined {
  return MOCK_DEALERS.find(d => d.id === dealerId);
}

// FCRA Audit Log entries
export const MOCK_FCRA_LOG = [
  { id: 'FCR-001', borrowerName: 'Marcus Johnson', pullType: 'Soft' as const, bureau: 'TransUnion', dateTime: '2026-03-07T14:31:00Z', purpose: 'Pre-qualification', consentOnFile: true, applicationId: 'APP-001', requestedBy: 'System' },
  { id: 'FCR-002', borrowerName: 'Diana Cruz', pullType: 'Soft' as const, bureau: 'Equifax', dateTime: '2026-03-08T09:16:00Z', purpose: 'Pre-qualification', consentOnFile: true, applicationId: 'APP-002', requestedBy: 'System' },
  { id: 'FCR-003', borrowerName: 'Kevin Park', pullType: 'Soft' as const, bureau: 'TransUnion', dateTime: '2026-03-06T11:46:00Z', purpose: 'Pre-qualification', consentOnFile: true, applicationId: 'APP-003', requestedBy: 'System' },
  { id: 'FCR-004', borrowerName: 'Aaliyah Thompson', pullType: 'Hard' as const, bureau: 'Experian', dateTime: '2026-02-21T10:00:00Z', purpose: 'Final approval', consentOnFile: true, applicationId: 'APP-004', requestedBy: 'Ally Financial' },
  { id: 'FCR-005', borrowerName: 'Jennifer Wu', pullType: 'Soft' as const, bureau: 'TransUnion', dateTime: '2026-03-07T10:01:00Z', purpose: 'Pre-qualification', consentOnFile: true, applicationId: 'APP-006', requestedBy: 'System' },
  { id: 'FCR-006', borrowerName: 'Darnell Foster', pullType: 'Soft' as const, bureau: 'Equifax', dateTime: '2026-03-08T08:01:00Z', purpose: 'Pre-qualification', consentOnFile: true, applicationId: 'APP-007', requestedBy: 'System' },
  { id: 'FCR-007', borrowerName: 'Tamika Williams', pullType: 'Hard' as const, bureau: 'Experian', dateTime: '2026-02-26T11:00:00Z', purpose: 'Final approval', consentOnFile: true, applicationId: 'APP-010', requestedBy: 'Westlake Financial' },
];

// Adverse action queue
export const MOCK_ADVERSE_ACTIONS = [
  { id: 'AA-001', applicationId: 'APP-007', borrowerName: 'Darnell Foster', declineDate: '2026-03-08T09:00:00Z', deadline: '2026-04-07T09:00:00Z', status: 'pending' as const, lenderName: 'All Lenders', reasonCode: 'Score below minimum', address: '2100 Main St Apt 12, Houston, TX 77002' },
];
