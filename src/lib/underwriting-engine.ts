export function computeLTV(loanAmount: number, vehicleValue: number): number {
  if (vehicleValue <= 0) return 0;
  return Math.round((loanAmount / vehicleValue) * 100);
}

export function computeDTI(totalMonthlyDebt: number, grossMonthlyIncome: number): number {
  if (grossMonthlyIncome <= 0) return 0;
  return Math.round((totalMonthlyDebt / grossMonthlyIncome) * 100);
}

export function computePTI(monthlyPayment: number, grossMonthlyIncome: number): number {
  if (grossMonthlyIncome <= 0) return 0;
  return Math.round((monthlyPayment / grossMonthlyIncome) * 100);
}

export function computeMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) return principal / termMonths;
  const monthlyRate = annualRate / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
}

export function computeTotalCost(monthlyPayment: number, termMonths: number): number {
  return monthlyPayment * termMonths;
}

export interface UnderwritingResult {
  ltvPass: boolean;
  dtiPass: boolean;
  ptiPass: boolean;
  ficoPass: boolean;
  overallPass: boolean;
  ltv: number;
  dti: number;
  pti: number;
}

export function evaluateUnderwriting(params: {
  loanAmount: number;
  vehicleValue: number;
  totalMonthlyDebt: number;
  grossMonthlyIncome: number;
  monthlyPayment: number;
  ficoScore: number | null;
  lenderMinFico: number;
  lenderMaxLtv: number;
  lenderMaxDti: number;
  lenderMaxPti?: number;
}): UnderwritingResult {
  const ltv = computeLTV(params.loanAmount, params.vehicleValue);
  const dti = computeDTI(params.totalMonthlyDebt, params.grossMonthlyIncome);
  const pti = computePTI(params.monthlyPayment, params.grossMonthlyIncome);

  const ltvPass = ltv <= params.lenderMaxLtv;
  const dtiPass = dti <= params.lenderMaxDti;
  const ptiPass = params.lenderMaxPti ? pti <= params.lenderMaxPti : true;
  const ficoPass = params.ficoScore === null ? true : params.ficoScore >= params.lenderMinFico;

  return {
    ltvPass,
    dtiPass,
    ptiPass,
    ficoPass,
    overallPass: ltvPass && dtiPass && ptiPass && ficoPass,
    ltv,
    dti,
    pti,
  };
}
