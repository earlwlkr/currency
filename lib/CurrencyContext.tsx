import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { get as getIdb, set } from 'idb-keyval';
import { getUrlParams, clearUrlParams } from '@/lib/urlParams';

// Half a day in milliseconds
const HALF_DAY = 12 * 60 * 60 * 1000;
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

type CurrencyContextType = {
  baseValue: number;
  setBaseValue: (value: number) => void;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  currenciesList: string[];
  setCurrenciesList: (list: string[]) => void;
  convertCurrency: (amount: number, toCurrency: string) => string;
  lastFetchTime: number | null;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const fetchCurrencyRates = async () => {
  if (typeof indexedDB === 'undefined') {
    return { rates: {}, lastFetchTime: null };
  }
  const lastFetchCurrencyRates = (await getIdb<number>('lastFetchCurrencyRates')) || 0;
  const storageData = await getIdb<string>('currencyRates');
  let cachedRates: { usd?: Record<string, number> } = {};
  try {
    cachedRates = JSON.parse(storageData || '{}');
  } catch {
    cachedRates = {};
  }

  if (Date.now() - lastFetchCurrencyRates < HALF_DAY && Object.keys(cachedRates).length > 0) {
    return {
      rates: cachedRates,
      lastFetchTime: lastFetchCurrencyRates,
    };
  }

  try {
    // Fetch fresh rates when cache is stale.
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }
    const currencyRates = await response.json();
    if (!currencyRates || typeof currencyRates !== 'object' || !('usd' in currencyRates)) {
      throw new Error('Invalid rates payload');
    }
    const now = Date.now();
    await set('lastFetchCurrencyRates', now);
    await set('currencyRates', JSON.stringify(currencyRates));
    return { rates: currencyRates, lastFetchTime: now };
  } catch {
    // Keep the app usable offline/when API is unavailable.
    return {
      rates: cachedRates,
      lastFetchTime: lastFetchCurrencyRates || null,
    };
  }
};

const formatter = Intl.NumberFormat('en-US');

const getStoredBaseValue = (): number => {
  if (typeof window === 'undefined') {
    return 100;
  }
  const storedValue = localStorage.getItem('baseValue');
  if (!storedValue) {
    return 100;
  }
  const parsedValue = Number(storedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 100;
};

const getStoredBaseCurrency = (): string => {
  if (typeof window === 'undefined') {
    return 'USD';
  }
  const storedBaseCurrency = localStorage.getItem('baseCurrency');
  if (!storedBaseCurrency) {
    return 'USD';
  }
  const normalized = storedBaseCurrency.trim().toUpperCase();
  return CURRENCY_CODE_REGEX.test(normalized) ? normalized : 'USD';
};

const getStoredCurrenciesList = (): string[] => {
  if (typeof window === 'undefined') {
    return ['USD', 'VND'];
  }
  const storedList = localStorage.getItem('currenciesList');
  if (!storedList) {
    return ['USD', 'VND'];
  }

  try {
    const parsedList = JSON.parse(storedList);
    if (!Array.isArray(parsedList)) {
      return ['USD', 'VND'];
    }
    const normalizedList = Array.from(
      new Set(
        parsedList
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim().toUpperCase())
          .filter((value) => CURRENCY_CODE_REGEX.test(value))
      )
    );
    return normalizedList.length > 0 ? normalizedList : ['USD', 'VND'];
  } catch {
    return ['USD', 'VND'];
  }
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const urlParams = getUrlParams();

  const [baseValue, setBaseValue] = useState<number>(() => {
    if (urlParams?.value !== undefined) {
      return urlParams.value;
    }
    return getStoredBaseValue();
  });

  const [baseCurrency, setBaseCurrency] = useState<string>(
    () => getStoredBaseCurrency()
  );

  const [currenciesList, setCurrenciesList] = useState<string[]>(() => {
    if (urlParams?.currencies && urlParams.currencies.length > 0) {
      return urlParams.currencies;
    }
    return getStoredCurrenciesList();
  });

  const [currenciesRates, setCurrenciesRates] = useState<{
    usd: Record<string, number>;
  }>({ usd: {} });

  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const convertCurrency = useCallback(
    (amount: number, toCurrency: string) => {
      if (baseCurrency === toCurrency) {
        return String(amount);
      }
      if (!currenciesRates || Object.keys(currenciesRates).length === 0) {
        return '';
      }

      const targetRate = currenciesRates.usd[toCurrency.toLowerCase()];
      if (!targetRate || !Number.isFinite(targetRate)) {
        return '';
      }

      const usdAmount = amount * targetRate;
      if (baseCurrency !== 'USD') {
        const baseRate = currenciesRates.usd[baseCurrency.toLowerCase()];
        if (!baseRate || !Number.isFinite(baseRate)) {
          return '';
        }
        return formatter.format(
          usdAmount / baseRate
        );
      }
      return formatter.format(usdAmount);
    },
    [baseCurrency, currenciesRates]
  );

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCurrencyRates();
      if (result) {
        setCurrenciesRates(result.rates);
        setLastFetchTime(result.lastFetchTime);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('baseValue', baseValue.toString());
  }, [baseValue]);

  useEffect(() => {
    localStorage.setItem('baseCurrency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('currenciesList', JSON.stringify(currenciesList));
  }, [currenciesList]);

  // Clear URL params after reading them to keep the URL clean
  useEffect(() => {
    if (urlParams) {
      clearUrlParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        baseValue,
        setBaseValue,
        baseCurrency,
        setBaseCurrency,
        currenciesList,
        setCurrenciesList,
        convertCurrency,
        lastFetchTime,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error(
      'useCurrencyContext must be used within a CurrencyProvider'
    );
  }
  return context;
};
