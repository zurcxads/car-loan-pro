import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatAPR(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date());
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function maskSSN(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`;
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function ficoColor(score: number | null): string {
  if (!score) return 'text-zinc-400';
  if (score >= 720) return 'text-green-400';
  if (score >= 660) return 'text-yellow-400';
  return 'text-red-400';
}

export function ltvColor(ltv: number): string {
  if (ltv < 110) return 'text-green-400';
  if (ltv <= 120) return 'text-yellow-400';
  return 'text-red-400';
}

export function dtiColor(dti: number): string {
  if (dti < 40) return 'text-green-400';
  if (dti <= 48) return 'text-yellow-400';
  return 'text-red-400';
}

export function ptiColor(pti: number): string {
  if (pti < 15) return 'text-green-400';
  if (pti <= 20) return 'text-yellow-400';
  return 'text-red-400';
}
