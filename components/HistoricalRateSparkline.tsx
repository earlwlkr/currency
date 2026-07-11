'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { fetchCurrencyRates } from '@/lib/CurrencyContext';

type HistoricalRateSparklineProps = {
  baseCurrency: string;
  currency: string;
};

type Point = {
  date: string;
  rate: number;
};

const DAYS = 7;

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function buildLastDates(days: number) {
  const dates: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

async function fetchDailyUsdRates(date: string) {
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
    void persistCurrencyRatesToIdb(storageKey, json);
  }

  return json;
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

    if (baseCurrency === currency) {
      return;
    }

    const run = async () => {
      setStatus('loading');
      try {
        const dates = buildLastDates(DAYS);
        const dailyRates = await Promise.all(dates.map((date) => fetchDailyUsdRates(date)));
        const nextPoints = dailyRates
          .map((rates, index) => {
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
  }, [baseCurrency, currency]);

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

  if (status === 'loading') {
    return <p className="mt-1 text-xs text-muted-foreground">Loading 7d trend…</p>;
  }

  if (status === 'error' || !trend) {
    return <p className="mt-1 text-xs text-muted-foreground">7d trend unavailable</p>;
  }

  const isUp = trend.delta >= 0;
  const path = buildSparklinePath(points);
  const strokeClass = isUp ? 'stroke-emerald-500' : 'stroke-rose-500';
  const fillClass = isUp ? 'text-emerald-500/10' : 'text-rose-500/10';

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex min-h-8 items-center gap-1.5 rounded-md pr-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={isExpanded}
      >
        <span>7d</span>
        <span className={isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
          {isUp ? '+' : ''}{trend.delta.toFixed(2)}%
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded ? (
        <div className="flex items-center justify-between gap-3 pb-1 pt-1">
          <p className="text-xs font-medium text-muted-foreground">
            1 {baseCurrency} ≈ {trend.last.toFixed(4)} {currency}
          </p>
          <svg
            viewBox="0 0 120 32"
            className="h-8 w-[120px] shrink-0 overflow-visible"
            role="img"
            aria-label={`Seven day trend from ${formatDayLabel(trend.startDate)} to ${formatDayLabel(trend.endDate)}`}
          >
            <path d={`M 0 32 ${path} L 120 32 Z`} className={fillClass} fill="currentColor" />
            <path d={path} className={strokeClass} fill="none" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
