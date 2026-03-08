import { MONTHS } from '../types';

export const calculateAge = (purchaseMonth: number, purchaseYear: number): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  let totalMonths = (currentYear - purchaseYear) * 12 + (currentMonth - purchaseMonth);

  // If calculating for future dates, just return 0
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0 && months === 0) return "Brand New";

  const yearString = years > 0 ? `${years} Year${years > 1 ? 's' : ''}` : '';
  const monthString = months > 0 ? `${months} Month${months > 1 ? 's' : ''}` : '';

  if (years > 0 && months > 0) return `${yearString} ${monthString} Old`;
  if (years > 0) return `${yearString} Old`;
  return `${monthString} Old`;
};

export const getMonthName = (index: number): string => {
  return MONTHS[index] || '';
};

/**
 * Calculates remaining warranty or returns "Warranty Expired"
 */
export const calculateWarrantyStatus = (
  purchaseMonth: number,
  purchaseYear: number,
  warrantyYears?: number
): string | null => {
  if (warrantyYears === undefined || warrantyYears <= 0) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Convert warranty years to months
  const warrantyMonths = Math.round(warrantyYears * 12);

  // Calculate expiry date
  let expiryMonth = purchaseMonth + warrantyMonths;
  let expiryYear = purchaseYear + Math.floor(expiryMonth / 12);
  expiryMonth = expiryMonth % 12;

  const totalMonthsRemaining = (expiryYear - currentYear) * 12 + (expiryMonth - currentMonth);

  if (totalMonthsRemaining < 0) {
    return 'Warranty Expired';
  }

  if (totalMonthsRemaining === 0) {
    return 'Expires this month';
  }

  const yearsRem = Math.floor(totalMonthsRemaining / 12);
  const monthsRem = totalMonthsRemaining % 12;

  const yearString = yearsRem > 0 ? `${yearsRem} Year${yearsRem > 1 ? 's' : ''}` : '';
  const monthString = monthsRem > 0 ? `${monthsRem} Month${monthsRem > 1 ? 's' : ''}` : '';

  if (yearsRem > 0 && monthsRem > 0) return `Expires in ${yearString} ${monthString}`;
  if (yearsRem > 0) return `Expires in ${yearString}`;
  return `Expires in ${monthString}`;
};

/**
 * Returns formatted expiration date string
 */
export const getWarrantyExpirationDate = (
  purchaseMonth: number,
  purchaseYear: number,
  warrantyYears?: number
): string | null => {
  if (warrantyYears === undefined || warrantyYears <= 0) return null;

  const totalMonths = purchaseMonth + Math.round(warrantyYears * 12);
  const expiryMonth = totalMonths % 12;
  const expiryYear = purchaseYear + Math.floor(totalMonths / 12);

  return `${getMonthName(expiryMonth).substring(0, 3)} ${expiryYear}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};