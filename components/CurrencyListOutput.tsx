'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  Trash2,
  X,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { calculate } from '@/lib/calculator';
import { HistoricalRateSparkline } from '@/components/HistoricalRateSparkline';

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
    lastFetchTime,
  } = useCurrencyContext();

  // Track input values separately to allow typing expressions
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [draggedCurrency, setDraggedCurrency] = useState<string | null>(null);
  const [updatedCurrency, setUpdatedCurrency] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const updateTimeoutRef = useRef<number | null>(null);

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
          setUpdatedCurrency(currency);
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
        setUpdatedCurrency(currency);
      }
    }

    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = window.setTimeout(() => setUpdatedCurrency(null), 450);
  };

  const handlePresetClick = (amount: number) => {
    setBaseValue(amount);
    setUpdatedCurrency('all');
    // Update all input values to reflect the new base value
    const newInputValues: Record<string, string> = {};
    currenciesList.forEach((currency) => {
      newInputValues[currency] = convertCurrency(amount, currency);
    });
    setInputValues(newInputValues);
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = window.setTimeout(() => setUpdatedCurrency(null), 450);
  };

  const moveCurrency = (currency: string, direction: -1 | 1) => {
    const currentIndex = currenciesList.indexOf(currency);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currenciesList.length) {
      return;
    }
    const nextList = [...currenciesList];
    [nextList[currentIndex], nextList[nextIndex]] = [nextList[nextIndex], nextList[currentIndex]];
    setCurrenciesList(nextList);
  };

  const reorderCurrency = (targetCurrency: string) => {
    if (!draggedCurrency || draggedCurrency === targetCurrency) {
      setDraggedCurrency(null);
      return;
    }
    const nextList = currenciesList.filter((currency) => currency !== draggedCurrency);
    const targetIndex = nextList.indexOf(targetCurrency);
    nextList.splice(targetIndex, 0, draggedCurrency);
    setCurrenciesList(nextList);
    setDraggedCurrency(null);
  };

  return (
    <div className="flex flex-col">
      {/* Preset Buttons */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 overflow-x-auto rounded-lg bg-muted p-1" aria-label="Preset amounts">
          {PRESETS.map((amount) => {
            const isActive = baseValue === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                className={`min-h-9 shrink-0 rounded-md px-2.5 text-xs font-semibold tabular-nums transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={isActive}
              >
                {amount.toLocaleString()}
              </button>
            );
          })}
        </div>
        {lastFetchTime ? (
          <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
            Rates · {new Date(lastFetchTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        ) : null}
      </div>

      {currenciesList.map((currency) => (
        <div
          key={currency}
          draggable
          onDragStart={() => setDraggedCurrency(currency)}
          onDragEnd={() => setDraggedCurrency(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => reorderCurrency(currency)}
          className={`row-enter group relative flex items-center gap-2 border-b border-border/60 py-3 pl-2 pr-0 transition-all ${
            baseCurrency === currency
              ? 'bg-accent/40 before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
              : 'hover:bg-muted/35'
          } ${draggedCurrency === currency ? 'opacity-40' : ''}`}
        >
          <button
            type="button"
            className="hidden min-h-11 w-7 shrink-0 cursor-grab items-center justify-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing sm:flex"
            aria-label={`Drag to reorder ${currency}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="w-12 shrink-0 self-start pt-2.5">
            <span className="block text-sm font-semibold">{currency}</span>
            {baseCurrency === currency ? (
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-primary">
                Base
              </span>
            ) : null}
          </div>
          <div className="flex-1">
            <div className="relative">
              <Input
                ref={(el) => {
                  inputRefs.current[currency] = el;
                }}
                id={currency}
                className={`border-transparent bg-transparent pr-11 text-lg font-medium tabular-nums shadow-none hover:border-input focus-visible:bg-background ${
                  updatedCurrency === currency || (updatedCurrency === 'all' && baseCurrency !== currency)
                    ? 'value-updated'
                    : ''
                }`}
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
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={`Clear ${currency} value`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <HistoricalRateSparkline baseCurrency={baseCurrency} currency={currency} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={`Open ${currency} actions`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => moveCurrency(currency, -1)}
                disabled={currenciesList.indexOf(currency) === 0}
              >
                <ChevronUp className="mr-2 h-4 w-4" />
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => moveCurrency(currency, 1)}
                disabled={currenciesList.indexOf(currency) === currenciesList.length - 1}
              >
                <ChevronDown className="mr-2 h-4 w-4" />
                Move down
              </DropdownMenuItem>
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
