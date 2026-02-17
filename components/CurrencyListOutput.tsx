'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Trash2, X } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { calculate } from '@/lib/calculator';

const PRESETS = [10, 50, 100, 500, 1000];

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

  // Track input values separately to allow typing expressions
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Update input values when baseValue/baseCurrency changes externally (presets, etc)
  useEffect(() => {
    const newInputValues: Record<string, string> = {};
    currenciesList.forEach((currency) => {
      // Only update if the input is not currently focused (user is not typing)
      if (document.activeElement !== inputRefs.current[currency]) {
        newInputValues[currency] = convertCurrency(baseValue, currency);
      }
    });
    setInputValues((prev) => ({ ...prev, ...newInputValues }));
  }, [baseValue, baseCurrency, currenciesList, convertCurrency]);

  const evaluateExpression = (currency: string) => {
    const inputValue = inputValues[currency];
    
    if (!inputValue) {
      setBaseValue(0);
      return;
    }
    
    setBaseCurrency(currency);
    
    // Check if it looks like an expression (contains operators)
    if (/[+\-*/]./.test(inputValue)) {
      try {
        const result = calculate(inputValue);
        if (!isNaN(result) && isFinite(result)) {
          setBaseValue(result);
          // Update the input to show the result
          setInputValues((prev) => ({
            ...prev,
            [currency]: String(result),
          }));
        }
      } catch {
        // Invalid expression, keep the raw input
      }
    } else {
      // Simple number
      const value = Number(inputValue.replace(/[^\d.]/g, ''));
      if (!isNaN(value)) {
        setBaseValue(value);
      }
    }
  };

  const handlePresetClick = (amount: number) => {
    setBaseValue(amount);
    // Update all input values to reflect the new base value
    const newInputValues: Record<string, string> = {};
    currenciesList.forEach((currency) => {
      newInputValues[currency] = String(amount);
    });
    setInputValues(newInputValues);
  };

  return (
    <div className="flex flex-col gap-y-2">
      {/* Preset Buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePresetClick(amount)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {amount.toLocaleString()}
          </button>
        ))}
      </div>

      {currenciesList.map((currency) => (
        <div
          key={currency}
          className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5"
        >
          <span className="text-sm font-semibold tracking-wide w-12 shrink-0">
            {currency}
          </span>
          <div className="relative flex-1">
            <Input
              ref={(el) => {
                inputRefs.current[currency] = el;
              }}
              id={currency}
              className="text-lg pr-10"
              value={inputValues[currency] ?? convertCurrency(baseValue, currency)}
              autoComplete="off"
              onChange={(e) => {
                setBaseCurrency(currency);
                setInputValues((prev) => ({
                  ...prev,
                  [currency]: e.target.value,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  evaluateExpression(currency);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onBlur={() => {
                evaluateExpression(currency);
              }}
              placeholder="0 or e.g. 100*3"
            />
            <button
              type="button"
              onClick={() => {
                setBaseCurrency(currency);
                setBaseValue(0);
                setInputValues((prev) => ({
                  ...prev,
                  [currency]: '',
                }));
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
                  // Remove from input values
                  setInputValues((prev) => {
                    const newValues = { ...prev };
                    delete newValues[currency];
                    return newValues;
                  });
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
