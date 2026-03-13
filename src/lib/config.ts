export const USE_MOCK_DATA = true;

export const FEATURE_FLAGS = {
  ITIN_BORROWERS: true,
  CO_BORROWER_FLOW: true,
  PLAID_INCOME: false,
  PRIVATE_PARTY: true,
  GAP_PRODUCTS: true,
  SPANISH_LOCALE: false,
  DEALER_NOTIFICATIONS: true,
  EMAIL_OFFERS: true,
};

export const ROUTING_CONFIG = {
  maxLendersPerSubmission: 5,
  submissionDelayMs: 500,
  retryOnTimeout: true,
  retryCount: 3,
  offerExpirationDays: 30,
};

export const CREDIT_PULL_PROVIDER = {
  provider: 'mock' as 'mock' | '700credit' | 'experian_connect',
  endpoint: '',
  credentialsConfigured: false,
};
