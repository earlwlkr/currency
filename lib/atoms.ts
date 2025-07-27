import { createStore } from 'jotai';

import { atomWithAsyncStorage } from '@/lib/asyncStorage';

export const baseAccordionAtom = atomWithAsyncStorage(
  'baseAccordion',
  'currency'
);

export const store = createStore();
