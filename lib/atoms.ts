import { atomWithStorage, loadable } from 'jotai/utils';
import { atom, createStore } from 'jotai';
import { SyncStorage } from 'jotai/vanilla/utils/atomWithStorage';

export type CurrencyRates = {
  date: string;
  usd: Record<string, number>;
};

export const baseValueAtom = atomWithStorage('baseValue', 100);
export const baseCurrencyAtom = atomWithStorage('baseCurrency', 'USD');
export const currencyListAtom = atomWithStorage('currencyList', ['USD', 'VND']);

const customStorage: SyncStorage<number> = {
  getItem: (key: string) => {
    if (typeof localStorage !== 'undefined') {
      return Number(localStorage.getItem(key)) || 0;
    }
    return 0;
  },
  setItem: (key: string, value: number) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value.toString());
    }
  },
  removeItem: (key: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const lastFetchCurrencyRatesAtom = atomWithStorage(
  'lastFetchCurrencyRates',
  0,
  customStorage,
  {
    getOnInit: true,
  }
);

const HALF_DAY = 12 * 60 * 60 * 1000;
export const currencyRatesAsyncAtom = atom(async (get, { signal }) => {
  const lastFetchCurrencyRates = get(lastFetchCurrencyRatesAtom);
  if (Date.now() - lastFetchCurrencyRates < HALF_DAY) {
    return JSON.parse(localStorage.getItem('currencyRates') || '{}');
  }

  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    { signal }
  );
  const currencyRates = await response.json();
  localStorage.setItem('currencyRates', JSON.stringify(currencyRates));
  localStorage.setItem('lastFetchCurrencyRates', Date.now().toString());
  return currencyRates;
});
export const currencyRatesAtom = loadable(currencyRatesAsyncAtom);

export const store = createStore();
