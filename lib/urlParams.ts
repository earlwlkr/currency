// Shared URL parameter handling for currency and timezone

export interface ShareableState {
  value?: number;
  currencies?: string[];
  timezones?: string[];
}

export const getUrlParams = (): ShareableState | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get('v');
  const currencies = params.get('c');
  const timezones = params.get('t');

  if (!value && !currencies && !timezones) return null;

  return {
    value: value ? Number(value) : undefined,
    currencies: currencies ? currencies.split(',') : undefined,
    timezones: timezones ? timezones.split(',') : undefined,
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
