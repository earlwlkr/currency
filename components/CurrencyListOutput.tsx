'use client';

import { GripVertical, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <GripVertical className="h-8 w-8 ml-2 px-1 rounded-md cursor-pointer hover:bg-slate-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setCurrenciesList(
                      currenciesList.filter((c) => c !== currency)
                    );
                    if (baseCurrency === currency) {
                      setBaseCurrency(currenciesList[0]);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

export { CurrencyListOutput };
