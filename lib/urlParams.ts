// Shared URL parameter handling for currency and timezone

export interface ShareableState {
  value?: number;
  currencies?: string[];
  timezones?: string[];
}

const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

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
      .filter((currency) => CURRENCY_CODE_REGEX.test(currency))
  );
  return unique.size > 0 ? Array.from(unique) : undefined;
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

export const getUrlParams = (): ShareableState | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const value = sanitizeValue(params.get('v'));
  const currencies = sanitizeCurrencies(params.get('c'));
  const timezones = sanitizeTimezones(params.get('t'));

  if (value === undefined && !currencies && !timezones) return null;

  return {
    value,
    currencies,
    timezones,
  };
};

export const generateShareableUrl = (state: {
  value: number;
  currencies: string[];
  timezones: string[];
}): string => {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams();
  params.set('v', String(state.value));
  params.set('c', state.currencies.join(','));
  if (state.timezones.length > 0) {
    params.set('t', state.timezones.join(','));
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const clearUrlParams = () => {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, document.title, window.location.pathname);
};
