'use client';

import { Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrencyContext } from '@/lib/CurrencyContext';

const CurrencyListOutput = () => {
  const {
    baseValue,
    setBaseValue,
    baseCurrency,
    setBaseCurrency,
    currenciesList,
    setCurrenciesList,
    convertCurrency,
  } = useCurrencyContext();

  return (
    <div className="flex flex-col gap-y-2">
      {currenciesList.map((currency) => (
        <div key={currency}>
          <div className="flex items-center">
            <Label htmlFor={currency} className="mr-2 text-lg">
              {currency}
            </Label>
            <Input
              key={currency}
              id={currency}
              className="text-lg my-2"
              value={convertCurrency(baseValue, currency)}
              autoComplete="off"
              onChange={(e) => {
                setBaseCurrency(currency);
                const value = Number(e.target.value.replace(/[^0-9.-]+/g, ''));
                if (!isNaN(value)) setBaseValue(value);
              }}
            />

            <button
              onClick={() => {
                setCurrenciesList(
                  currenciesList.filter((c) => c !== currency)
                );
                if (baseCurrency === currency) {
                  setBaseCurrency(currenciesList[0]);
                }
              }}
              className="ml-2 px-1 text-muted-foreground hover:text-red-500 transition-colors"
              aria-label={`Remove ${currency}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { CurrencyListOutput };
