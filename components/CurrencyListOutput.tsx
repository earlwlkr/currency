'use client';

import { MoreVertical, Trash2, X } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
            <div className="relative flex-1">
              <Input
                key={currency}
                id={currency}
                className="text-lg my-2 pr-16"
                value={convertCurrency(baseValue, currency)}
                autoComplete="off"
                onChange={(e) => {
                  setBaseCurrency(currency);
                  const value = Number(e.target.value.replace(/[^0-9.-]+/g, ''));
                  if (!isNaN(value)) setBaseValue(value);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setBaseCurrency(currency);
                  setBaseValue(0);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Clear ${currency} value`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Open ${currency} actions`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const updatedList = currenciesList.filter(
                      (c) => c !== currency
                    );
                    setCurrenciesList(updatedList);
                    if (baseCurrency === currency) {
                      setBaseCurrency(updatedList[0] || 'USD');
                    }
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
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
