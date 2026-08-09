'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';

import { HistoricalRateSparkline } from '@/components/HistoricalRateSparkline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { calculate } from '@/lib/calculator';
import { formatCurrencyName } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';

const PRESETS = [10, 50, 100, 500, 1000];

const normalizeAmount = (value: string) => value.replace(/,/g, '').trim();

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
  const [updatedCurrency, setUpdatedCurrency] = useState<string | null>(null);
  const [invalidCurrency, setInvalidCurrency] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const updateTimeoutRef = useRef<number | null>(null);
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

  useEffect(
    () => () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
    },
    []
  );

  const markUpdated = (currency: string) => {
    setUpdatedCurrency(currency);
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = window.setTimeout(
      () => setUpdatedCurrency(null),
      450
    );
  };

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
        [currency]: String(result),
      }));
      setInvalidCurrency(null);
      markUpdated(currency);
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

  const handlePresetClick = (amount: number) => {
    setBaseValue(amount);
    setInputValues((current) => ({
      ...current,
      [baseCurrency]: String(amount),
    }));
    markUpdated('all');
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

  const rateStatusLabel = (() => {
    if (rateStatus === 'loading') return 'Updating rates…';
    if (rateStatus === 'error') return 'Rates unavailable';
    if (rateStatus === 'offline') return 'Offline rates';
    if (!lastFetchTime) return 'Rates ready';
    return `Updated ${new Date(lastFetchTime).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })}`;
  })();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              rateStatus === 'error'
                ? 'bg-destructive'
                : rateStatus === 'loading'
                  ? 'animate-pulse bg-primary'
                  : rateStatus === 'offline'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
            )}
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {rateStatusLabel}
          </span>
          {rateStatus === 'error' || rateStatus === 'offline' ? (
            <button
              type="button"
              onClick={() => void refreshRates()}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-primary transition-colors hover:bg-accent"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1" aria-label="Quick amounts">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Quick
          </span>
          {PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetClick(amount)}
              className={cn(
                'numeric min-h-10 rounded-full px-2.5 text-[11px] font-semibold transition-colors',
                baseValue === amount
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-pressed={baseValue === amount}
            >
              {amount === 1000 ? '1k' : amount}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border">
        {currenciesList.map((currency) => {
          const isBase = baseCurrency === currency;
          const currencyIndex = currenciesList.indexOf(currency);

          return (
            <div
              key={currency}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorderCurrency(currency)}
              className={cn(
                'row-enter group relative grid min-h-[96px] grid-cols-[minmax(84px,0.7fr)_minmax(0,1.3fr)_44px] items-center gap-2 border-t border-border/80 py-4 transition-[background-color,opacity] first:border-t-0 sm:grid-cols-[28px_minmax(128px,0.7fr)_minmax(0,1.3fr)_44px]',
                isBase && 'bg-accent/45',
                draggedCurrency === currency && 'opacity-35'
              )}
            >
              {isBase ? (
                <span className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-primary" />
              ) : null}

              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  setDraggedCurrency(currency);
                }}
                onDragEnd={() => setDraggedCurrency(null)}
                className="hidden h-10 w-7 cursor-grab items-center justify-center text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing sm:flex"
                aria-label={`Drag to reorder ${currency}`}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              <div className="min-w-0 pl-3 sm:pl-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-[0.04em]">
                    {currency}
                  </span>
                  {isBase ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                      Base
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {formatCurrencyName(currency)}
                </p>
              </div>

              <div className="min-w-0 text-right">
                <div className="relative">
                  <label className="sr-only" htmlFor={`amount-${currency}`}>
                    Amount in {formatCurrencyName(currency)}
                  </label>
                  <input
                    ref={(element) => {
                      inputRefs.current[currency] = element;
                    }}
                    id={`amount-${currency}`}
                    className={cn(
                      'numeric h-12 w-full rounded-lg border border-transparent bg-transparent pl-2 pr-9 text-right text-xl font-semibold outline-none transition-[border-color,background-color] placeholder:text-muted-foreground/50 hover:border-input focus:border-primary focus:bg-background sm:text-2xl',
                      (updatedCurrency === currency ||
                        (updatedCurrency === 'all' && !isBase)) &&
                        'value-updated',
                      invalidCurrency === currency && 'border-destructive'
                    )}
                    value={
                      inputValues[currency] ??
                      convertCurrency(baseValue, currency)
                    }
                    inputMode="decimal"
                    autoComplete="off"
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
                    placeholder={rateStatus === 'loading' ? '…' : '—'}
                    aria-invalid={invalidCurrency === currency}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBaseCurrency(currency);
                      setBaseValue(0);
                      setInputValues((current) => ({
                        ...current,
                        [currency]: '',
                      }));
                      inputRefs.current[currency]?.focus();
                    }}
                    className="absolute right-0 top-1/2 flex h-10 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground opacity-60 transition-[opacity,color] hover:text-foreground group-focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Clear ${currency} amount`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {invalidCurrency === currency ? (
                  <p className="mt-1 text-[11px] font-medium text-destructive" role="alert">
                    Check this amount or calculation
                  </p>
                ) : (
                  <HistoricalRateSparkline
                    key={`${baseCurrency}-${currency}`}
                    baseCurrency={baseCurrency}
                    currency={currency}
                  />
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Open ${currency} actions`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => moveCurrency(currency, -1)}
                    disabled={currencyIndex === 0}
                  >
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Move up
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => moveCurrency(currency, 1)}
                    disabled={currencyIndex === currenciesList.length - 1}
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Move down
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removeCurrency(currency)}
                    disabled={currenciesList.length <= 1}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { CurrencyListOutput };
