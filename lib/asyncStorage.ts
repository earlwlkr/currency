import { get, set, del } from 'idb-keyval';
import { atomWithStorage } from 'jotai/utils';

export function atomWithAsyncStorage<T>(key: string, initial: T) {
  return atomWithStorage<T>(
    key,
    initial,
    {
      setItem: (key, value) => set(key, value),
      getItem: (key) =>
        get<T>(key).then((value) => {
          console.log('get1', value, initial);
          if (value !== undefined) {
            return value;
          }
          console.log('get2', value, initial);
          if (initial !== undefined) {
            set(key, initial);
          }
          console.log('get3', value, initial);
          return initial;
        }),
      removeItem: (key: string) => {
        return del(key);
      },
    },
    {
      getOnInit: true,
    }
  );
}
