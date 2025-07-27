import { createStore } from 'jotai';

import { atomWithAsyncStorage } from '@/lib/asyncStorage';

export const timezoneListAtom = atomWithAsyncStorage('timezoneList', [
  'Asia/Saigon',
  'America/New_York',
  'Europe/London',
]);

export const store = createStore();
