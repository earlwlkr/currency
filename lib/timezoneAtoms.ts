import { get as getIdb, set } from 'idb-keyval';
import { loadable } from 'jotai/utils';
import { atom, createStore } from 'jotai';

import { atomWithAsyncStorage } from '@/lib/asyncStorage';

export type CurrencyRates = {
  date: string;
  usd: Record<string, number>;
};

export const timezoneListAtom = atomWithAsyncStorage('timezoneList', [
  'Asia/Saigon',
  'America/New_York',
  'Europe/London',
]);

export const store = createStore();
