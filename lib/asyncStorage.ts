import { get, set, del } from 'idb-keyval';
import { atomWithStorage } from 'jotai/utils';

export function atomWithAsyncStorage<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(
    key,
    initialValue,
    {
      setItem: (key, value) => {
        if (typeof indexedDB !== 'undefined') {
          return set(key, value);
        }
        return Promise.resolve();
      },
      getItem: async (key) => {
        if (typeof indexedDB === 'undefined') {
          return Promise.resolve(initialValue);
        }
        const value_1 = await get<T>(key);
        if (value_1 !== undefined) {
          return value_1;
        }
        if (initialValue !== undefined) {
          set(key, initialValue);
        }
        return initialValue;
      },
      removeItem: (key: string) => {
        if (typeof indexedDB !== 'undefined') {
          return del(key);
        }
        return Promise.resolve();
      },
    },
    {
      getOnInit: true,
    }
  );
}
