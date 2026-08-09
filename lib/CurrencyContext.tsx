'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { get as getIdb, set } from 'idb-keyval';

import { clearUrlParams, getUrlParams } from '@/lib/urlParams';

const HALF_DAY = 12 * 60 * 60 * 1000;
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

interface CurrencyRates {
  usd: Record<string, number>;
}

type RateStatus = 'loading' | 'ready' | 'offline' | 'error';

interface CurrencyContextType {
  baseValue: number;
  setBaseValue: (value: number) => void;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  currenciesList: string[];
  setCurrenciesList: (list: string[]) => void;
  convertCurrency: (amount: number, toCurrency: string) => string;
  convertCurrencyValue: (amount: number, toCurrency: string) => number | null;
  lastFetchTime: number | null;
  rateStatus: RateStatus;
  refreshRates: () => Promise<void>;
}

interface CurrencyRatesResult {
  rates: CurrencyRates;
  lastFetchTime: number | null;
  source: 'cache' | 'network' | 'none';
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const hasRates = (rates: Partial<CurrencyRates>): rates is CurrencyRates =>
  Boolean(
    rates.usd &&
      typeof rates.usd === 'object' &&
      Object.values(rates.usd).some((rate) => Number.isFinite(rate))
  );

export const fetchCurrencyRates = async (
  forceRefresh = false
): Promise<CurrencyRatesResult> => {
  const canPersist = typeof indexedDB !== 'undefined';
  let lastFetchCurrencyRates = 0;
  let cachedRates: Partial<CurrencyRates> = {};

  if (canPersist) {
    try {
      lastFetchCurrencyRates =
        (await getIdb<number>('lastFetchCurrencyRates')) || 0;
      const storageData = await getIdb<string>('currencyRates');
      cachedRates = JSON.parse(storageData || '{}') as Partial<CurrencyRates>;
    } catch {
      cachedRates = {};
    }
  }

  if (
    !forceRefresh &&
    Date.now() - lastFetchCurrencyRates < HALF_DAY &&
    hasRates(cachedRates)
  ) {
    return {
      rates: cachedRates,
      lastFetchTime: lastFetchCurrencyRates,
      source: 'cache',
    };
  }

  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }

    const payload = (await response.json()) as Partial<CurrencyRates>;
    if (!hasRates(payload)) {
      throw new Error('Invalid rates payload');
    }

    const now = Date.now();
    if (canPersist) {
      try {
        await Promise.all([
          set('lastFetchCurrencyRates', now),
          set('currencyRates', JSON.stringify(payload)),
        ]);
      } catch {
        // A valid network response should remain usable if persistence is blocked.
      }
    }

    return { rates: payload, lastFetchTime: now, source: 'network' };
  } catch {
    if (hasRates(cachedRates)) {
      return {
        rates: cachedRates,
        lastFetchTime: lastFetchCurrencyRates || null,
        source: 'cache',
      };
    }

    return { rates: { usd: {} }, lastFetchTime: null, source: 'none' };
  }
};

const standardFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
});
const smallValueFormatter = new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 6,
});

const getStoredBaseValue = (): number => {
  if (typeof window === 'undefined') return 100;
  try {
    const storedValue = localStorage.getItem('baseValue');
    if (!storedValue) return 100;
    const parsedValue = Number(storedValue);
    return Number.isFinite(parsedValue) ? parsedValue : 100;
  } catch {
    return 100;
  }
};

const getStoredBaseCurrency = (): string => {
  if (typeof window === 'undefined') return 'USD';
  try {
    const normalized = (localStorage.getItem('baseCurrency') || 'USD')
      .trim()
      .toUpperCase();
    return CURRENCY_CODE_REGEX.test(normalized) ? normalized : 'USD';
  } catch {
    return 'USD';
  }
};

const getStoredCurrenciesList = (): string[] => {
  if (typeof window === 'undefined') return ['USD', 'VND'];
  try {
    const storedList = localStorage.getItem('currenciesList');
    if (!storedList) return ['USD', 'VND'];
    const parsedList = JSON.parse(storedList) as unknown;
    if (!Array.isArray(parsedList)) return ['USD', 'VND'];

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
  const storedBaseCurrency = getStoredBaseCurrency();
  const initialCurrencies =
    urlParams?.currencies && urlParams.currencies.length > 0
      ? urlParams.currencies
      : getStoredCurrenciesList();
  const initialBaseCurrency =
    urlParams?.baseCurrency && initialCurrencies.includes(urlParams.baseCurrency)
      ? urlParams.baseCurrency
      : initialCurrencies.includes(storedBaseCurrency)
        ? storedBaseCurrency
        : initialCurrencies[0] || 'USD';

  const [baseValue, setBaseValue] = useState<number>(
    urlParams?.value ?? getStoredBaseValue()
  );
  const [baseCurrency, setBaseCurrency] = useState(initialBaseCurrency);
  const [currenciesList, setCurrenciesList] = useState(initialCurrencies);
  const [currenciesRates, setCurrenciesRates] = useState<CurrencyRates>({
    usd: {},
  });
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [rateStatus, setRateStatus] = useState<RateStatus>('loading');

  const loadRates = useCallback(async (forceRefresh = false) => {
    setRateStatus('loading');
    const result = await fetchCurrencyRates(forceRefresh);
    setCurrenciesRates(result.rates);
    setLastFetchTime(result.lastFetchTime);

    if (!hasRates(result.rates)) {
      setRateStatus('error');
      return;
    }

    const isStale =
      result.lastFetchTime === null ||
      Date.now() - result.lastFetchTime >= HALF_DAY;
    setRateStatus(result.source === 'cache' && isStale ? 'offline' : 'ready');
  }, []);

  const refreshRates = useCallback(async () => {
    await loadRates(true);
  }, [loadRates]);

  const convertCurrencyValue = useCallback(
    (amount: number, toCurrency: string): number | null => {
      if (baseCurrency === toCurrency) return amount;

      const targetRate = currenciesRates.usd[toCurrency.toLowerCase()];
      if (!Number.isFinite(targetRate)) return null;

      if (baseCurrency === 'USD') return amount * targetRate;

      const baseRate = currenciesRates.usd[baseCurrency.toLowerCase()];
      if (!Number.isFinite(baseRate) || baseRate === 0) return null;
      return (amount * targetRate) / baseRate;
    },
    [baseCurrency, currenciesRates]
  );

  const convertCurrency = useCallback(
    (amount: number, toCurrency: string) => {
      const converted = convertCurrencyValue(amount, toCurrency);
      if (converted === null) return '';
      if (baseCurrency === toCurrency) return String(amount);
      return Math.abs(converted) > 0 && Math.abs(converted) < 0.01
        ? smallValueFormatter.format(converted)
        : standardFormatter.format(converted);
    },
    [baseCurrency, convertCurrencyValue]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadRates(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadRates]);

  useEffect(() => {
    try {
      localStorage.setItem('baseValue', baseValue.toString());
    } catch {
      // Conversion remains usable when storage is unavailable.
    }
  }, [baseValue]);

  useEffect(() => {
    try {
      localStorage.setItem('baseCurrency', baseCurrency);
    } catch {
      // Conversion remains usable when storage is unavailable.
    }
  }, [baseCurrency]);

  useEffect(() => {
    try {
      localStorage.setItem('currenciesList', JSON.stringify(currenciesList));
    } catch {
      // Conversion remains usable when storage is unavailable.
    }
  }, [currenciesList]);

  useEffect(() => {
    if (!urlParams) return;
    const timeout = window.setTimeout(clearUrlParams, 0);
    return () => window.clearTimeout(timeout);
    // URL state is intentionally read once during provider initialization.
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
        convertCurrencyValue,
        lastFetchTime,
        rateStatus,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
};
