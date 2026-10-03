'use client';

import { useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';

import { HistoricalRateSparkline } from '@/components/HistoricalRateSparkline';
import { RowActions } from '@/components/RowActions';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { calculate } from '@/lib/calculator';
import {
  formatAmount,
  formatCurrencyName,
  formatRate,
} from '@/lib/currencyUtils';
import { cn, selectAllOnFocus } from '@/lib/utils';

const normalizeAmount = (value: string) => value.replace(/,/g, '').trim();

// Long amounts step down in size instead of being clipped on narrow screens.
const amountSizeClass = (value: string) => {
  if (value.length > 15) return 'text-lg';
  if (value.length > 11) return 'text-[22px]';
  return 'text-[28px]';
};

const CurrencyListOutput = () => {
  const {
    baseValue,
    setBaseValue,
    baseCurrency,
    setBaseCurrency,
    currenciesList,
    setCurrenciesList,
    convertCurrency,
    convertCurrencyValue,
    lastFetchTime,
    rateStatus,
    refreshRates,
  } = useCurrencyContext();

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [draggedCurrency, setDraggedCurrency] = useState<string | null>(null);
  const [invalidCurrency, setInvalidCurrency] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const skipBlurEvaluationRef = useRef<string | null>(null);

  useEffect(() => {
    const nextValues: Record<string, string> = {};
    currenciesList.forEach((currency) => {
      if (document.activeElement !== inputRefs.current[currency]) {
        nextValues[currency] = convertCurrency(baseValue, currency);
      }
    });
    setInputValues((current) => ({ ...current, ...nextValues }));
  }, [baseCurrency, baseValue, convertCurrency, currenciesList]);

  const evaluateExpression = (currency: string) => {
    const rawValue = inputValues[currency] ?? '';
    const normalizedValue = normalizeAmount(rawValue);

    if (!normalizedValue) {
      setBaseCurrency(currency);
      setBaseValue(0);
      setInvalidCurrency(null);
      return;
    }

    try {
      const result = /[+\-*/()]/.test(normalizedValue)
        ? calculate(normalizedValue)
        : Number(normalizedValue);

      if (!Number.isFinite(result)) throw new Error('Invalid amount');

      setBaseCurrency(currency);
      setBaseValue(result);
      setInputValues((current) => ({
        ...current,
        [currency]: formatAmount(result, currency),
      }));
      setInvalidCurrency(null);
    } catch {
      setInvalidCurrency(currency);
    }
  };

  const handleAmountChange = (currency: string, value: string) => {
    setInputValues((current) => ({ ...current, [currency]: value }));
    setInvalidCurrency(null);

    const normalizedValue = normalizeAmount(value);
    if (!normalizedValue) {
      setBaseCurrency(currency);
      setBaseValue(0);
      return;
    }

    if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalizedValue)) {
      const nextValue = Number(normalizedValue);
      if (Number.isFinite(nextValue)) {
        setBaseCurrency(currency);
        setBaseValue(nextValue);
      }
    }
  };

  const moveCurrency = (currency: string, direction: -1 | 1) => {
    const currentIndex = currenciesList.indexOf(currency);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currenciesList.length) {
      return;
    }

    const nextList = [...currenciesList];
    [nextList[currentIndex], nextList[nextIndex]] = [
      nextList[nextIndex],
      nextList[currentIndex],
    ];
    setCurrenciesList(nextList);
  };

  const reorderCurrency = (targetCurrency: string) => {
    if (!draggedCurrency || draggedCurrency === targetCurrency) {
      setDraggedCurrency(null);
      return;
    }

    const nextList = currenciesList.filter(
      (currency) => currency !== draggedCurrency
    );
    const targetIndex = nextList.indexOf(targetCurrency);
    nextList.splice(targetIndex, 0, draggedCurrency);
    setCurrenciesList(nextList);
    setDraggedCurrency(null);
  };

  const removeCurrency = (currency: string) => {
    if (currenciesList.length <= 1) return;

    const nextList = currenciesList.filter((item) => item !== currency);
    if (baseCurrency === currency) {
      const nextBase = nextList[0];
      const nextValue = convertCurrencyValue(baseValue, nextBase);
      if (nextValue === null) return;
      setBaseCurrency(nextBase);
      setBaseValue(nextValue);
    }

    setCurrenciesList(nextList);
    setInputValues((current) => {
      const nextValues = { ...current };
      delete nextValues[currency];
      return nextValues;
    });
  };

  // Shows the pair in whichever direction reads as a number above one,
  // e.g. "1 USD = 25,954 VND" rather than "1 VND = 0.0000385 USD".
  const getRatePair = (currency: string) => {
    const rate = convertCurrencyValue(1, currency);
    if (currency === baseCurrency || rate === null || rate <= 0) return null;
    return rate >= 1
      ? { from: baseCurrency, to: currency, rate }
      : { from: currency, to: baseCurrency, rate: 1 / rate };
  };

  const lastUpdated = lastFetchTime
    ? new Date(lastFetchTime).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const rateStatusLabel = (() => {
    if (rateStatus === 'loading') return 'Updating rates…';
    if (rateStatus === 'error') return 'Couldn’t load exchange rates';
    if (rateStatus === 'offline') {
      return lastUpdated ? `Offline, using rates from ${lastUpdated}` : 'Offline';
    }
    return lastUpdated ? `Rates updated ${lastUpdated}` : 'Rates ready';
  })();

  return (
    <div>
      <div className="flex min-h-10 items-center justify-between gap-3 pb-2 text-[13px]">
        <p
          className={cn(
            'text-muted-foreground',
            rateStatus === 'error' && 'text-destructive'
          )}
          aria-live="polite"
        >
          {rateStatusLabel}
        </p>
        {rateStatus === 'error' || rateStatus === 'offline' ? (
          <button
            type="button"
            onClick={() => void refreshRates()}
            className="-mr-2 h-10 rounded-md px-2 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Retry
          </button>
        ) : null}
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {currenciesList.map((currency, index) => {
          const name = formatCurrencyName(currency);
          const value =
            inputValues[currency] ?? convertCurrency(baseValue, currency);
          const ratePair = getRatePair(currency);

          return (
            <li
              key={currency}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorderCurrency(currency)}
              className={cn(
                'group relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_auto] items-start gap-3 py-3',
                draggedCurrency === currency && 'opacity-40'
              )}
            >
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  setDraggedCurrency(currency);
                }}
                onDragEnd={() => setDraggedCurrency(null)}
                className="absolute -left-8 top-3 hidden h-10 w-6 cursor-grab items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-foreground active:cursor-grabbing group-hover:opacity-100 sm:flex"
                aria-label={`Drag to reorder ${currency}`}
                tabIndex={-1}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              <div className="min-w-0 pt-2.5">
                <p className="text-[15px] font-semibold leading-5">{currency}</p>
                <p className="truncate text-[13px] leading-5 text-muted-foreground">
                  {name}
                </p>
              </div>

              <div className="min-w-0 text-right">
                <label className="sr-only" htmlFor={`amount-${currency}`}>
                  Amount in {name}
                </label>
                <input
                  ref={(element) => {
                    inputRefs.current[currency] = element;
                  }}
                  id={`amount-${currency}`}
                  className={cn(
                    'h-10 w-full rounded-md bg-transparent px-1 text-right font-normal tabular-nums tracking-tight caret-primary outline-none transition-colors placeholder:text-muted-foreground/60 hover:bg-muted/60 focus:bg-muted focus:shadow-[inset_0_-2px_0_hsl(var(--primary))] focus-visible:outline-none',
                    amountSizeClass(value),
                    invalidCurrency === currency &&
                      'shadow-[inset_0_-2px_0_hsl(var(--destructive))] focus:shadow-[inset_0_-2px_0_hsl(var(--destructive))]'
                  )}
                  value={value}
                  inputMode="decimal"
                  autoComplete="off"
                  enterKeyHint="done"
                  {...selectAllOnFocus}
                  onChange={(event) =>
                    handleAmountChange(currency, event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      evaluateExpression(currency);
                      event.currentTarget.blur();
                    }
                    if (event.key === 'Escape') {
                      skipBlurEvaluationRef.current = currency;
                      setInputValues((current) => ({
                        ...current,
                        [currency]: convertCurrency(baseValue, currency),
                      }));
                      setInvalidCurrency(null);
                      event.currentTarget.blur();
                    }
                  }}
                  onBlur={() => {
                    if (skipBlurEvaluationRef.current === currency) {
                      skipBlurEvaluationRef.current = null;
                      return;
                    }
                    evaluateExpression(currency);
                  }}
                  placeholder={rateStatus === 'loading' ? '…' : '0'}
                  aria-invalid={invalidCurrency === currency}
                  aria-describedby={
                    invalidCurrency === currency
                      ? `amount-${currency}-error`
                      : undefined
                  }
                />
                {invalidCurrency === currency ? (
                  <p
                    id={`amount-${currency}-error`}
                    className="px-1 text-[13px] leading-7 text-destructive"
                    role="alert"
                  >
                    Enter a number or a sum like 120*3
                  </p>
                ) : ratePair ? (
                  <HistoricalRateSparkline
                    key={`${ratePair.from}-${ratePair.to}`}
                    from={ratePair.from}
                    to={ratePair.to}
                    label={`1 ${ratePair.from} = ${formatRate(ratePair.rate)} ${ratePair.to}`}
                  />
                ) : (
                  <div className="h-7" aria-hidden="true" />
                )}
              </div>

              <RowActions
                label={currency}
                index={index}
                count={currenciesList.length}
                onMove={(direction) => moveCurrency(currency, direction)}
                onRemove={() => removeCurrency(currency)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { CurrencyListOutput };
