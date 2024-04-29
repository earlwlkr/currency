'use client';

import {
  baseCurrencyAtom,
  baseValueAtom,
  currencyListAtom,
  currencyRatesAtom,
} from '@/lib/atoms';
import { convert } from '@/lib/currency';
import { useAtom, useAtomValue } from 'jotai';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CurrencyOutput = () => {
  const [baseValue, setBaseValue] = useAtom(baseValueAtom);
  const [baseCurrency, setBaseCurrency] = useAtom(baseCurrencyAtom);
  const currencyList = useAtomValue(currencyListAtom);
  const currencyRates = useAtomValue(currencyRatesAtom);
  return (
    <div className="flex flex-col gap-y-2">
      {currencyList.map((currency) => (
        <div key={currency}>
          <Label htmlFor={currency}>{currency}</Label>
          <Input
            key={currency}
            id={currency}
            type="number"
            value={convert(baseValue, baseCurrency, currency, currencyRates)}
            onFocus={(e) => {
              setBaseCurrency(currency);
              setBaseValue(Number(e.target.value));
            }}
            onChange={(e) => {
              setBaseCurrency(currency);
              setBaseValue(Number(e.target.value));
            }}
          />
        </div>
      ))}
    </div>
  );
};

export { CurrencyOutput };
