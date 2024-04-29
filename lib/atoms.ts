import { atomWithStorage } from 'jotai/utils';
import currencyRatesData from '@/config/currency-rates.json';

export type CurrencyRate = {
  date: string;
  usd: Record<string, number>;
};

export const baseValueAtom = atomWithStorage('baseValue', 100);
export const baseCurrencyAtom = atomWithStorage('baseCurrency', 'USD');
export const currencyListAtom = atomWithStorage('currencyList', ['USD', 'VND']);

// https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
export const currencyRatesAtom = atomWithStorage(
  'currencyRates',
  currencyRatesData
);
