'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type HistoricalRateSparklineProps = {
  baseCurrency: string;
  currency: string;
};

type Point = {
  date: string;
  rate: number;
};

const DAYS = 7;
const dailyRequestCache = new Map<string, Promise<{ usd?: Record<string, number> }>>();

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

function buildLastDates(days: number) {
  const dates: string[] = [];
  for (let offset = days; offset >= 1; offset -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

async function fetchDailyUsdRatesUncached(date: string) {
  const storageKey = `currencyRates:${date}`;

  if (typeof indexedDB !== 'undefined') {
    try {
      const cached = await fetchCurrencyRatesFromIdb(storageKey);
      if (cached) {
        return cached;
      }
    } catch {
      // Fall through to network.
    }
  }

  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch historical rates for ${date}`);
  }

  const json = await response.json();

  if (typeof indexedDB !== 'undefined') {
    void persistCurrencyRatesToIdb(storageKey, json).catch(() => undefined);
  }

  return json;
}

function fetchDailyUsdRates(date: string) {
  const existingRequest = dailyRequestCache.get(date);
  if (existingRequest) return existingRequest;

  const request = fetchDailyUsdRatesUncached(date).catch((error: unknown) => {
    dailyRequestCache.delete(date);
    throw error;
  });
  dailyRequestCache.set(date, request);
  return request;
}

async function fetchCurrencyRatesFromIdb(key: string) {
  const { get } = await import('idb-keyval');
  const cached = await get<string>(key);
  return cached ? JSON.parse(cached) : null;
}

async function persistCurrencyRatesToIdb(key: string, value: unknown) {
  const { set } = await import('idb-keyval');
  await set(key, JSON.stringify(value));
}

function calculatePairRate(
  rates: { usd?: Record<string, number> },
  baseCurrency: string,
  targetCurrency: string
) {
  const base = baseCurrency.toLowerCase();
  const target = targetCurrency.toLowerCase();

  if (base === target) {
    return 1;
  }

  const usdRates = rates.usd ?? {};
  const targetRate = usdRates[target];

  if (!Number.isFinite(targetRate)) {
    return null;
  }

  if (base === 'usd') {
    return targetRate;
  }

  const baseRate = usdRates[base];
  if (!Number.isFinite(baseRate) || baseRate === 0) {
    return null;
  }

  return targetRate / baseRate;
}

function buildSparklinePath(points: Point[]) {
  if (points.length === 0) {
    return '';
  }

  const width = 120;
  const height = 32;
  const values = points.map((point) => point.rate);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.rate - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function HistoricalRateSparkline({
  baseCurrency,
  currency,
}: HistoricalRateSparklineProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!isExpanded || baseCurrency === currency) {
      return;
    }

    const run = async () => {
      setStatus('loading');
      try {
        const dates = buildLastDates(DAYS);
        const dailyRates = await Promise.allSettled(
          dates.map((date) => fetchDailyUsdRates(date))
        );
        const nextPoints = dailyRates
          .map((result, index) => {
            if (result.status !== 'fulfilled') return null;
            const rates = result.value;
            const rate = calculatePairRate(rates, baseCurrency, currency);
            if (rate === null || !Number.isFinite(rate)) {
              return null;
            }
            return {
              date: dates[index],
              rate,
            } satisfies Point;
          })
          .filter((point): point is Point => point !== null);

        if (!isCancelled) {
          setPoints(nextPoints);
          setStatus(nextPoints.length >= 2 ? 'ready' : 'error');
        }
      } catch {
        if (!isCancelled) {
          setPoints([]);
          setStatus('error');
        }
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [baseCurrency, currency, isExpanded]);

  const trend = useMemo(() => {
    if (points.length < 2) {
      return null;
    }

    const first = points[0].rate;
    const last = points[points.length - 1].rate;
    const delta = ((last - first) / first) * 100;

    return {
      last,
      delta,
      startDate: points[0].date,
      endDate: points[points.length - 1].date,
    };
  }, [points]);

  if (baseCurrency === currency) {
    return null;
  }

  const isUp = (trend?.delta ?? 0) >= 0;
  const path = buildSparklinePath(points);
  const strokeClass = isUp ? 'stroke-emerald-500' : 'stroke-rose-500';
  const fillClass = isUp ? 'text-emerald-500/10' : 'text-rose-500/10';

  return (
    <div className="mt-0.5 flex flex-col items-end">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex min-h-7 items-center gap-1.5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-expanded={isExpanded}
      >
        <span>{trend ? '7d' : '7d trend'}</span>
        {trend ? (
          <span className={isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
            {isUp ? '+' : ''}{trend.delta.toFixed(2)}%
          </span>
        ) : null}
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded ? (
        status === 'loading' ? (
          <p className="py-2 text-[11px] text-muted-foreground">Loading trend…</p>
        ) : status === 'error' || !trend ? (
          <p className="py-2 text-[11px] text-muted-foreground">Trend unavailable</p>
        ) : (
          <div className="flex items-center justify-end gap-3 pb-1 pt-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              1 {baseCurrency} ≈ {trend.last.toFixed(4)} {currency}
            </p>
            <svg
              viewBox="0 0 120 32"
              className="h-7 w-[104px] shrink-0 overflow-visible"
              role="img"
              aria-label={`Seven day trend from ${formatDayLabel(trend.startDate)} to ${formatDayLabel(trend.endDate)}`}
            >
              <path d={`M 0 32 ${path} L 120 32 Z`} className={fillClass} fill="currentColor" />
              <path d={path} className={strokeClass} fill="none" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )
      ) : null}
    </div>
  );
}
