import { z } from 'zod';

// ---------- Auth ----------

export const loginSchema = z.object({
  email: z.string().min(1, 'Email required'),
  password: z.string().min(1, 'Password required'),
});

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name required'),
  role: z.enum(['consumer', 'dealer', 'lender', 'admin']),
});

// ---------- Application ----------

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name required'),
  suffix: z.string().optional(),
  ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$|^ITIN$/, 'Valid SSN required'),
  dob: z.string().min(1, 'Date of birth required'),
  driversLicenseNumber: z.string().optional(),
  driversLicenseState: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  preferredLanguage: z.enum(['english', 'spanish', 'other']).optional(),
});

export const addressInfoSchema = z.object({
  currentAddressLine1: z.string().min(1, 'Address required'),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().min(1, 'City required'),
  currentState: z.string().min(2, 'State required'),
  currentZip: z.string().regex(/^\d{5}$/, 'Valid ZIP required'),
  residenceType: z.enum(['own', 'rent', 'other']),
  monthlyHousingPayment: z.number().min(0),
  monthsAtCurrentAddress: z.number().min(0),
  prevAddressLine1: z.string().optional(),
  prevAddressCity: z.string().optional(),
  prevAddressState: z.string().optional(),
  prevAddressZip: z.string().optional(),
  monthsAtPrevAddress: z.number().optional(),
});

export const employmentInfoSchema = z.object({
  employmentStatus: z.enum(['full_time', 'part_time', 'self_employed', 'retired', 'other']),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  employerPhone: z.string().optional(),
  jobTitle: z.string().optional(),
  monthsAtEmployer: z.number().min(0),
  grossMonthlyIncome: z.number().min(1, 'Income required'),
  incomeTypePrimary: z.enum(['employment', 'self_employed', 'retirement', 'disability', 'ssi', 'child_support', 'other']),
  otherIncomeSource: z.string().optional(),
  otherIncomeMonthly: z.number().optional(),
  incomeVerificationMethod: z.string().optional(),
});

export const vehicleInfoSchema = z.object({
  applicationType: z.enum(['new_vehicle', 'used_vehicle', 'refinance', 'private_party']),
  vehicleCondition: z.enum(['new', 'used', 'certified_pre_owned']),
  year: z.number().min(1990).max(new Date().getFullYear() + 2),
  make: z.string().min(1, 'Make required'),
  model: z.string().min(1, 'Model required'),
  trim: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().optional(),
  askingPrice: z.number().min(1, 'Price required'),
  isPrivateParty: z.boolean(),
  dealerName: z.string().optional(),
  dealerZip: z.string().optional(),
});

export const dealStructureSchema = z.object({
  cashDownPayment: z.number().min(0),
  hasTradeIn: z.boolean(),
  tradeInYear: z.number().optional(),
  tradeInMake: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInVin: z.string().optional(),
  tradeInPayoffAmount: z.number().optional(),
  desiredTermMonths: z.union([z.literal(36), z.literal(48), z.literal(60), z.literal(72), z.literal(84)]),
  maxMonthlyPayment: z.number().optional(),
  gapInsuranceInterest: z.boolean(),
  extendedWarrantyInterest: z.boolean(),
});

export const consentSchema = z.object({
  softPullConsent: z.literal(true, 'Soft pull consent required'),
  hardPullConsent: z.boolean(),
  tcpaConsent: z.literal(true, 'TCPA consent required'),
  termsOfService: z.literal(true, 'Terms acceptance required'),
  privacyPolicy: z.literal(true, 'Privacy policy acceptance required'),
  eSignConsent: z.literal(true, 'E-Sign consent required'),
});

export const applicationSubmitSchema = z.object({
  personalInfo: personalInfoSchema,
  addressInfo: addressInfoSchema,
  employmentInfo: employmentInfoSchema,
  vehicleInfo: vehicleInfoSchema.optional(),
  dealStructure: dealStructureSchema.partial().extend({
    desiredTermMonths: z.union([z.literal(36), z.literal(48), z.literal(60), z.literal(72), z.literal(84)]).default(60),
    cashDownPayment: z.number().min(0).default(0),
    hasTradeIn: z.boolean().default(false),
    gapInsuranceInterest: z.boolean().default(false),
    extendedWarrantyInterest: z.boolean().default(false),
  }),
  consent: consentSchema,
  hasCoBorrower: z.boolean(),
  coBorrowerInfo: personalInfoSchema.merge(addressInfoSchema).merge(employmentInfoSchema).optional(),
});

// ---------- Offer Selection ----------

export const selectOfferSchema = z.object({
  offerId: z.string().min(1),
  applicationId: z.string().min(1),
  hardPullConsent: z.literal(true, 'Hard pull consent required'),
});

// ---------- Lender Decision ----------

export const lenderDecisionSchema = z.object({
  applicationId: z.string().min(1),
  decision: z.enum(['approve', 'decline', 'counter']),
  apr: z.number().min(0).max(36).optional(),
  approvedAmount: z.number().min(0).optional(),
  termMonths: z.number().min(12).max(84).optional(),
  conditions: z.array(z.string()).optional(),
  declineReason: z.string().optional(),
}).strict();

// ---------- Deal Submission ----------

export const dealSubmitSchema = z.object({
  applicationId: z.string().min(1),
  offerId: z.string().min(1),
  dealerId: z.string().min(1),
  vin: z.string().min(17).max(17, 'VIN must be 17 characters'),
  salePrice: z.number().min(1),
  downPayment: z.number().min(0),
  tradeInValue: z.number().min(0).optional(),
});

// ---------- Admin ----------

export const updateLenderSchema = z.object({
  lenderId: z.string().min(1),
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  minFico: z.number().min(0).max(850).optional(),
  maxLtv: z.number().min(0).max(200).optional(),
  maxDti: z.number().min(0).max(100).optional(),
  referralFee: z.number().min(0).optional(),
}).strict();

export const updateDealerSchema = z.object({
  dealerId: z.string().min(1),
  status: z.enum(['active', 'suspended', 'pending']).optional(),
  plan: z.string().min(1).optional(),
  planPrice: z.number().min(0).optional(),
}).strict();

// Types derived from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ApplicationSubmitInput = z.infer<typeof applicationSubmitSchema>;
export type SelectOfferInput = z.infer<typeof selectOfferSchema>;
export type LenderDecisionInput = z.infer<typeof lenderDecisionSchema>;
export type DealSubmitInput = z.infer<typeof dealSubmitSchema>;
export type UpdateLenderInput = z.infer<typeof updateLenderSchema>;
export type UpdateDealerInput = z.infer<typeof updateDealerSchema>;
