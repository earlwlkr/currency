import { get, set, del } from 'idb-keyval';
import { atomWithStorage } from 'jotai/utils';

export function atomWithAsyncStorage<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T = (
    _value: unknown
  ): _value is T => true
) {
  return atomWithStorage<T>(
    key,
    initialValue,
    {
      setItem: (key, value) => {
        if (typeof indexedDB !== 'undefined') {
          return set(key, value).catch(() => undefined);
        }
        return Promise.resolve();
      },
      getItem: async (key) => {
        if (typeof indexedDB === 'undefined') {
          return Promise.resolve(initialValue);
        }
        try {
          const value = await get<unknown>(key);
          if (value !== undefined && isValid(value)) {
            return value;
          }
          if (initialValue !== undefined) {
            void set(key, initialValue).catch(() => undefined);
          }
          return initialValue;
        } catch {
          return initialValue;
        }
      },
      removeItem: (key: string) => {
        if (typeof indexedDB !== 'undefined') {
          return del(key).catch(() => undefined);
        }
        return Promise.resolve();
      },
    },
    {
      getOnInit: true,
    }
  );
}
