'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type HistoricalRateSparklineProps = {
  from: string;
  to: string;
  label: string;
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
  from,
  to,
  label,
}: HistoricalRateSparklineProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!isExpanded || from === to) {
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
            const rate = calculatePairRate(rates, from, to);
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
  }, [from, to, isExpanded]);

  const trend = useMemo(() => {
    if (points.length < 2) {
      return null;
    }

    const first = points[0].rate;
    const last = points[points.length - 1].rate;
    const delta = ((last - first) / first) * 100;

    return {
      delta,
      startDate: points[0].date,
      endDate: points[points.length - 1].date,
    };
  }, [points]);

  if (from === to) {
    return null;
  }

  const isUp = (trend?.delta ?? 0) >= 0;
  const path = buildSparklinePath(points);

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="inline-flex h-7 max-w-full items-center gap-1 rounded-md px-1 text-[13px] tabular-nums text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={isExpanded}
        title="Show 7-day trend"
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      {isExpanded ? (
        status === 'ready' && trend ? (
          <div className="flex items-center gap-3 px-1 pb-1 pt-0.5">
            <p
              className={cn(
                'text-[13px] tabular-nums',
                isUp
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              )}
            >
              {isUp ? '+' : ''}
              {trend.delta.toFixed(2)}% in 7 days
            </p>
            <svg
              viewBox="0 0 120 32"
              className="h-6 w-20 shrink-0 overflow-visible"
              role="img"
              aria-label={`${from} to ${to}, ${formatDayLabel(trend.startDate)} to ${formatDayLabel(trend.endDate)}`}
            >
              <path
                d={path}
                className={isUp ? 'stroke-emerald-500' : 'stroke-rose-500'}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        ) : (
          <p className="px-1 pb-1 text-[13px] text-muted-foreground">
            {status === 'error' ? '7-day trend unavailable' : 'Loading 7-day trend…'}
          </p>
        )
      ) : null}
    </div>
  );
}
