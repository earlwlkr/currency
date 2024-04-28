'use client';

import {
  baseCurrencyAtom,
  baseValueAtom,
  currencyListAtom,
  currencyRatesAtom,
  type CurrencyRate,
} from '@/lib/atoms';
import { useAtomValue } from 'jotai';

function convert(
  amount: number,
  baseCurrency: string,
  toCurrency: string,
  currencyRates: CurrencyRate
) {
  if (baseCurrency === 'USD') {
    return amount * currencyRates.usd[toCurrency.toLowerCase()];
  }
  const usdRate = currencyRates.usd[baseCurrency.toLowerCase()];
  return amount * (1 / usdRate) * currencyRates.usd[toCurrency.toLowerCase()];
}

const CurrencyOutput = () => {
  const baseValue = useAtomValue(baseValueAtom);
  const baseCurrency = useAtomValue(baseCurrencyAtom);
  const currencyList = useAtomValue(currencyListAtom);
  const currencyRates = useAtomValue(currencyRatesAtom);
  return (
    <div>
      {currencyList.map((currency) => (
        <div key={currency}>
          {currency}:{' '}
          {convert(baseValue, baseCurrency, currency, currencyRates)}
        </div>
      ))}
    </div>
  );
};

export { CurrencyOutput };
