import { atom, createStore } from 'jotai';

import { atomWithAsyncStorage } from '@/lib/asyncStorage';

const isTimezoneList = (value: unknown): value is string[] => {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((timezone) => {
    if (typeof timezone !== 'string') return false;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  });
};

export const timezoneListAtom = atomWithAsyncStorage('timezoneList', [
  'Asia/Saigon',
  'America/New_York',
  'Europe/London',
], isTimezoneList);

export const comparisonTimeAtom = atom<string | null>(null);

export const store = createStore();
