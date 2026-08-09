import countryByCurrencyCode from '@/config/country-by-currency-code.json';

// Shared URL parameter handling for currency and timezone.

export interface ShareableState {
  value?: number;
  baseCurrency?: string;
  currencies?: string[];
  timezones?: string[];
  comparisonTime?: string;
  workspace?: 'currency' | 'time';
}

const SUPPORTED_CURRENCIES = new Set(
  countryByCurrencyCode.map((item) => item.currency_code)
);

const sanitizeValue = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sanitizeCurrencies = (currencies: string | null): string[] | undefined => {
  if (!currencies) return undefined;
  const unique = new Set(
    currencies
      .split(',')
      .map((currency) => currency.trim().toUpperCase())
      .filter((currency) => SUPPORTED_CURRENCIES.has(currency))
  );
  return unique.size > 0 ? Array.from(unique) : undefined;
};

const sanitizeBaseCurrency = (currency: string | null): string | undefined => {
  if (!currency) return undefined;
  const normalized = currency.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(normalized) ? normalized : undefined;
};

const isValidTimezone = (timezone: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

const sanitizeTimezones = (timezones: string | null): string[] | undefined => {
  if (!timezones) return undefined;
  const unique = new Set(
    timezones
      .split(',')
      .map((timezone) => timezone.trim())
      .filter((timezone) => timezone.length > 0 && isValidTimezone(timezone))
  );
  return unique.size > 0 ? Array.from(unique) : undefined;
};

const sanitizeComparisonTime = (value: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
};

const sanitizeWorkspace = (
  value: string | null
): 'currency' | 'time' | undefined =>
  value === 'currency' || value === 'time' ? value : undefined;

export const getUrlParams = (): ShareableState | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const value = sanitizeValue(params.get('v'));
  const baseCurrency = sanitizeBaseCurrency(params.get('b'));
  const currencies = sanitizeCurrencies(params.get('c'));
  const timezones = sanitizeTimezones(params.get('t'));
  const comparisonTime = sanitizeComparisonTime(params.get('at'));
  const workspace = sanitizeWorkspace(params.get('w'));

  if (
    value === undefined &&
    !baseCurrency &&
    !currencies &&
    !timezones &&
    !comparisonTime &&
    !workspace
  ) {
    return null;
  }

  return {
    value,
    baseCurrency,
    currencies,
    timezones,
    comparisonTime,
    workspace,
  };
};

export const generateShareableUrl = (state: {
  value: number;
  baseCurrency: string;
  currencies: string[];
  timezones: string[];
  comparisonTime: string | null;
  workspace: 'currency' | 'time';
}): string => {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams();
  params.set('v', String(state.value));
  params.set('b', state.baseCurrency);
  params.set('c', state.currencies.join(','));
  if (state.timezones.length > 0) {
    params.set('t', state.timezones.join(','));
  }
  if (state.comparisonTime) params.set('at', state.comparisonTime);
  params.set('w', state.workspace);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const clearUrlParams = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  ['v', 'b', 'c', 't', 'at', 'w'].forEach((key) => url.searchParams.delete(key));
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
};
