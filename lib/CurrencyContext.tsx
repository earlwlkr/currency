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
  const lastFetchCurrencyRates =
    (await getIdb<number>('lastFetchCurrencyRates')) || 0;
  if (Date.now() - lastFetchCurrencyRates < HALF_DAY) {
    const storageData = await getIdb<string>('currencyRates');
    return {
      rates: JSON.parse(storageData || '{}'),
      lastFetchTime: lastFetchCurrencyRates,
    };
  }
  // Fetch new currency rates
  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
  );
  const currencyRates = await response.json();
  const now = Date.now();
  await set('lastFetchCurrencyRates', now);
  await set('currencyRates', JSON.stringify(currencyRates));
  return { rates: currencyRates, lastFetchTime: now };
};

const formatter = Intl.NumberFormat('en-US');

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const urlParams = getUrlParams();

  const [baseValue, setBaseValue] = useState<number>(() => {
    if (urlParams?.value !== undefined) return urlParams.value;
    return typeof window !== 'undefined' && localStorage.getItem('baseValue')
      ? Number(localStorage.getItem('baseValue'))
      : 100;
  });

  const [baseCurrency, setBaseCurrency] = useState<string>(
    () =>
      (typeof window !== 'undefined' && localStorage.getItem('baseCurrency')) ||
      'USD'
  );

  const [currenciesList, setCurrenciesList] = useState<string[]>(() => {
    if (urlParams?.currencies) return urlParams.currencies;
    const storedList =
      typeof window !== 'undefined' && localStorage.getItem('currenciesList');
    return storedList ? JSON.parse(storedList) : ['USD', 'VND'];
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

      const usdAmount = amount * currenciesRates.usd[toCurrency.toLowerCase()];
      if (baseCurrency !== 'USD') {
        return formatter.format(
          usdAmount / currenciesRates.usd[baseCurrency.toLowerCase()]
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
