export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'AED' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  label: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD', locale: 'en-US' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', label: '₹ INR', locale: 'en-IN' },
  { code: 'EUR', symbol: '€', name: 'Euro', label: '€ EUR', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', label: '£ GBP', locale: 'en-GB' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', label: 'CA$ CAD', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', label: 'A$ AUD', locale: 'en-AU' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', label: '¥ JPY', locale: 'ja-JP' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', label: 'AED', locale: 'en-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', label: 'S$ SGD', locale: 'en-SG' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';
export const CURRENCY_STORAGE_KEY = 'tech_tracker_currency';

export function getDefaultCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (saved && SUPPORTED_CURRENCIES.some(c => c.code === saved)) {
    return saved as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

export function setDefaultCurrency(code: CurrencyCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  }
}

export function getCurrencyConfig(code?: string): CurrencyConfig {
  const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
  return found || SUPPORTED_CURRENCIES[0];
}

export function formatPrice(amount?: number | null, currencyCode?: string): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  const code = (currencyCode as CurrencyCode) || getDefaultCurrency();
  const config = getCurrencyConfig(code);
  return `${config.symbol}${amount.toLocaleString(config.locale)}`;
}
