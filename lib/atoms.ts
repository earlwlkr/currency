import { get as getIdb, set } from 'idb-keyval';
import { loadable } from 'jotai/utils';
import { atom, createStore } from 'jotai';

import { atomWithAsyncStorage } from '@/lib/asyncStorage';

export type CurrencyRates = {
  date: string;
  usd: Record<string, number>;
};

export const baseValueAtom = atomWithAsyncStorage('baseValue', 100);
export const baseCurrencyAtom = atomWithAsyncStorage('baseCurrency', 'USD');
export const currencyListAtom = atomWithAsyncStorage('currencyList', [
  'USD',
  'VND',
]);

export const lastFetchCurrencyRatesAtom = atomWithAsyncStorage(
  'lastFetchCurrencyRates',
  0
);

const HALF_DAY = 12 * 60 * 60 * 1000;
export const currencyRatesAsyncAtom = atom(async (get, { signal }) => {
  if (typeof indexedDB === 'undefined') {
    return {};
  }
  const lastFetchCurrencyRates = await get(lastFetchCurrencyRatesAtom);
  console.log(
    'last fetch currency rates:',
    new Date(lastFetchCurrencyRates).toLocaleString()
  );
  if (Date.now() - lastFetchCurrencyRates < HALF_DAY) {
    const storageData = await getIdb<string>('currencyRates');
    return JSON.parse(storageData || '{}');
  }

  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    { signal }
  );
  const currencyRates = await response.json();
  set('lastFetchCurrencyRates', Date.now());
  set('currencyRates', JSON.stringify(currencyRates));
  return currencyRates;
});
export const currencyRatesAtom = loadable(currencyRatesAsyncAtom);

export const store = createStore();
