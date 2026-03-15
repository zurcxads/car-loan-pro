"use client";

import { Application, LenderOffer, CreditPullResult, ApplicationStatus } from '@/lib/types';
import { SAMPLE_LENDERS } from '@/lib/constants';

const APP_KEY = 'clp_application';
const APPS_KEY = 'clp_applications';
const OFFERS_KEY = 'clp_offers';
const CREDIT_KEY = 'clp_credit';

// --- Helpers ---
function generateId(): string {
  return 'clp_' + Math.random().toString(36).substring(2, 11);
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// --- Credit ---
export function generateCreditProfile(fico?: number): CreditPullResult {
  const score = fico || Math.floor(Math.random() * 160) + 620;
  const dti = randomBetween(18, 48);
  return {
    ficoScore: score,
    vantageScore: score + Math.floor(Math.random() * 20) - 10,
    dtiPercent: dti,
    totalMonthlyObligations: Math.round(randomBetween(800, 3200)),
    openAutoTradelines: Math.floor(Math.random() * 3),
    derogatoryMarks: score > 700 ? 0 : Math.floor(Math.random() * 3),
    hasRepo: score < 550 && Math.random() > 0.6,
    hasBankruptcy: score < 520 && Math.random() > 0.7,
  };
}

export function saveCreditProfile(credit: CreditPullResult) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CREDIT_KEY, JSON.stringify(credit));
}

export function getCreditProfile(): CreditPullResult | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CREDIT_KEY);
  return data ? JSON.parse(data) : null;
}

// --- Application ---
export function saveApplication(data: Partial<Application>): Application {
  if (typeof window === 'undefined') return data as Application;
  const existing = getApplication();
  const app: Application = {
    id: existing?.id || generateId(),
    userId: existing?.userId || 'user_' + generateId(),
    status: 'submitted',
    createdAt: existing?.createdAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    hasCoBorrower: false,
    ...existing,
    ...data,
  } as Application;
  localStorage.setItem(APP_KEY, JSON.stringify(app));
  // Also save to the list
  const apps = getAllApplications();
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx >= 0) apps[idx] = app;
  else apps.push(app);
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  return app;
}

export function getApplication(): Application | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(APP_KEY);
  return data ? JSON.parse(data) : null;
}

export function getAllApplications(): Application[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(APPS_KEY);
  if (data) return JSON.parse(data);
  // Seed sample data
  const samples = getSampleApplications();
  localStorage.setItem(APPS_KEY, JSON.stringify(samples));
  return samples;
}

// --- Offers ---
export function getOffers(app?: Application | null): LenderOffer[] {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(OFFERS_KEY);
  if (cached) return JSON.parse(cached);
  const application = app || getApplication();
  if (!application) return [];
  const credit = getCreditProfile() || generateCreditProfile();
  const offers = generateOffers(application, credit);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  return offers;
}

export function saveOffers(offers: LenderOffer[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

function generateOffers(app: Application, credit: CreditPullResult): LenderOffer[] {
  const loanAmount = (app.vehicleInfo?.askingPrice || 30000) - (app.dealStructure?.cashDownPayment || 0);
  return SAMPLE_LENDERS.filter(l => credit.ficoScore >= l.minFico).map(lender => {
    const rateAdjust = (780 - credit.ficoScore) * 0.008;
    const apr = Math.max(lender.apr + randomBetween(-0.5, rateAdjust), 1.99);
    const term = app.dealStructure?.desiredTermMonths || 60;
    const monthlyRate = apr / 100 / 12;
    const payment = monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
      : loanAmount / term;
    const isDeclined = credit.dtiPercent > 50 && lender.tier === 'prime';
    return {
      id: generateId(),
      applicationId: app.id,
      lenderName: lender.name,
      tier: lender.tier,
      status: isDeclined ? 'declined' as const : 'approved' as const,
      approvedAmount: Math.round(loanAmount * randomBetween(0.95, 1.05)),
      apr: Math.round(apr * 100) / 100,
      termMonths: term,
      monthlyPayment: Math.round(payment * 100) / 100,
      conditions: generateConditions(lender.tier),
      decisionAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

function generateConditions(tier: string): string[] {
  const base = ['Proof of income (last 2 pay stubs)', 'Valid driver\'s license'];
  if (tier === 'subprime' || tier === 'specialty') {
    base.push('Proof of residence', 'Bank statements (last 3 months)');
  }
  if (tier === 'near_prime') {
    base.push('Employment verification letter');
  }
  return base;
}

export function getLenders() {
  return SAMPLE_LENDERS;
}

// --- Sample Data ---
function getSampleApplications(): Application[] {
  const statuses: ApplicationStatus[] = ['submitted', 'processing', 'funded', 'draft'];
  const names = [
    { first: 'Maria', last: 'Garcia' },
    { first: 'James', last: 'Wilson' },
    { first: 'Sarah', last: 'Chen' },
    { first: 'Michael', last: 'Brown' },
  ];
  return names.map((name, i) => ({
    id: `sample_${i + 1}`,
    userId: `user_sample_${i + 1}`,
    status: statuses[i],
    createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    submittedAt: statuses[i] !== 'draft' ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    hasCoBorrower: i === 2,
    personalInfo: {
      firstName: name.first, lastName: name.last,
      ssn: '***-**-' + (1000 + i * 111), dob: `199${i}-0${i + 1}-1${i + 5}`,
      email: `${name.first.toLowerCase()}@example.com`, phone: `(555) ${100 + i}-${1000 + i * 100}`,
      preferredLanguage: 'english' as const,
    },
    addressInfo: {
      currentAddressLine1: `${100 + i * 100} Main St`, currentCity: 'Austin',
      currentState: 'TX', currentZip: `7870${i}`,
      residenceType: i % 2 === 0 ? 'own' as const : 'rent' as const,
      monthlyHousingPayment: 1200 + i * 200, monthsAtCurrentAddress: 24 + i * 12,
    },
    employmentInfo: {
      employmentStatus: 'full_time' as const, employerName: `Company ${String.fromCharCode(65 + i)}`,
      jobTitle: ['Engineer', 'Manager', 'Nurse', 'Designer'][i],
      monthsAtEmployer: 18 + i * 6, grossMonthlyIncome: 5000 + i * 1000,
      incomeTypePrimary: 'employment' as const,
    },
    vehicleInfo: {
      applicationType: 'used_vehicle' as const, vehicleCondition: 'used' as const,
      year: 2022 + (i % 3), make: ['Toyota', 'Honda', 'Ford', 'BMW'][i],
      model: ['Camry', 'Civic', 'F-150', 'X3'][i], askingPrice: 25000 + i * 5000,
      isPrivateParty: false,
    },
    dealStructure: {
      cashDownPayment: 2000 + i * 500, hasTradeIn: i % 2 === 0,
      desiredTermMonths: ([60, 72, 48, 60] as const)[i],
      gapInsuranceInterest: true, extendedWarrantyInterest: false,
    },
    consent: {
      softPullConsent: true, hardPullConsent: false,
      tcpaConsent: true, termsOfService: true, privacyPolicy: true, eSignConsent: true,
    },
  } as Application));
}
