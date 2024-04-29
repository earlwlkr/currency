'use client';

import { baseCurrencyAtom, baseValueAtom, currencyListAtom } from '@/lib/atoms';
import { convert } from '@/lib/currency';
import { useAtom, useAtomValue } from 'jotai';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CurrencyOutput = () => {
  const [baseValue, setBaseValue] = useAtom(baseValueAtom);
  const [baseCurrency, setBaseCurrency] = useAtom(baseCurrencyAtom);
  const currencyList = useAtomValue(currencyListAtom);
  return (
    <div className="flex flex-col gap-y-2">
      {currencyList.map((currency) => (
        <div key={currency}>
          <Label htmlFor={currency}>{currency}</Label>
          <Input
            key={currency}
            id={currency}
            value={convert(baseValue, baseCurrency, currency)}
            onChange={(e) => {
              setBaseCurrency(currency);
              const value = Number(e.target.value);
              if (!isNaN(value)) setBaseValue(value);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export { CurrencyOutput };
