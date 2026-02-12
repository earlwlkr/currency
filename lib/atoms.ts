import { createStore } from 'jotai';

import { atomWithAsyncStorage } from '@/lib/asyncStorage';

export const baseAccordionAtom = atomWithAsyncStorage(
  'baseAccordion',
  ['currency'] as string[] | string
);

export const store = createStore();
