import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

type CurrencyContextType = {
  baseValue: number;
  setBaseValue: (value: number) => void;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  currenciesList: string[];
  setCurrenciesList: (list: string[]) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [baseValue, setBaseValue] = useState<number>(() =>
    localStorage.getItem('baseValue')
      ? Number(localStorage.getItem('baseValue'))
      : 100
  );
  const [baseCurrency, setBaseCurrency] = useState<string>(
    () => localStorage.getItem('baseCurrency') || 'USD'
  );
  const [currenciesList, setCurrenciesList] = useState<string[]>(() => {
    const storedList = localStorage.getItem('currenciesList');
    return storedList ? JSON.parse(storedList) : ['USD', 'VND'];
  });

  useEffect(() => {
    localStorage.setItem('baseValue', baseValue.toString());
  }, [baseValue]);

  useEffect(() => {
    localStorage.setItem('baseCurrency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('currenciesList', JSON.stringify(currenciesList));
  }, [currenciesList]);

  return (
    <CurrencyContext.Provider
      value={{
        baseValue,
        setBaseValue,
        baseCurrency,
        setBaseCurrency,
        currenciesList,
        setCurrenciesList,
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
