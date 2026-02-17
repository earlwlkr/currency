'use client';

import { MoreVertical, Trash2, X } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
        <div
          key={currency}
          className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
        >
          <span className="text-sm font-semibold tracking-wide font-mono w-12 shrink-0">
            {currency}
          </span>
          <div className="relative flex-1">
            <Input
              key={currency}
              id={currency}
              className="text-lg pr-10"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={`Clear ${currency} value`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
      ))}
    </div>
  );
};

export { CurrencyListOutput };
