'use client';

import { useEffect, useState } from 'react';
import { Clock3, Coins } from 'lucide-react';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { ShareButton } from '@/components/ShareButton';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { getUrlParams } from '@/lib/urlParams';
import { cn } from '@/lib/utils';

type Workspace = 'currency' | 'time';

function ConverterWorkspace() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(
    () => getUrlParams()?.workspace ?? 'currency'
  );

  return (
    <main className="min-h-svh bg-background">
      <header className="border-b border-border/80">
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-bold tracking-[-0.05em] text-background"
              aria-hidden="true"
            >
              CR
            </span>
            <div className="hidden min-w-0 sm:block">
              <h1 className="truncate text-sm font-bold uppercase tracking-[0.16em]">
                Current
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Money and time, aligned
              </p>
            </div>
          </div>

          <nav
            className="absolute left-1/2 flex -translate-x-1/2 items-center rounded-full bg-muted p-1"
            aria-label="Converter workspace"
          >
            {([
              ['currency', 'Currency', Coins],
              ['time', 'Time', Clock3],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveWorkspace(value)}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-[background-color,color,transform] duration-200 sm:px-4',
                  activeWorkspace === value
                    ? 'bg-background text-foreground shadow-[0_1px_4px_rgba(20,20,16,0.08)]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-pressed={activeWorkspace === value}
              >
                <Icon className="hidden h-3.5 w-3.5 sm:block" />
                {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto">
            <ShareButton workspace={activeWorkspace} />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section
          className={cn(
            'workspace-enter grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16',
            activeWorkspace !== 'currency' && 'hidden'
          )}
          aria-labelledby="currency-heading"
        >
            <div className="lg:sticky lg:top-8">
              <p className="section-index">01 / Currency</p>
              <h2 id="currency-heading" className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Convert once.
                <br className="hidden lg:block" /> Read every rate.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Edit any amount to make it the base. Simple calculations work too.
              </p>
            </div>

            <div className="min-w-0">
              <CurrencyListOutput />
              <CurrencyInput />
            </div>
        </section>

        <section
          className={cn(
            'workspace-enter grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16',
            activeWorkspace !== 'time' && 'hidden'
          )}
          aria-labelledby="time-heading"
        >
            <div className="lg:sticky lg:top-8">
              <p className="section-index">02 / Time</p>
              <h2 id="time-heading" className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Keep every city
                <br className="hidden lg:block" /> on the same page.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Compare right now, or choose a local date and time to plan ahead.
              </p>
            </div>

            <TimezoneConverter />
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsHydrated(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isHydrated) {
    return (
      <main className="grid min-h-svh place-items-center bg-background" aria-label="Loading converter">
        <span className="h-5 w-5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      </main>
    );
  }

  return (
    <CurrencyProvider>
      <ConverterWorkspace />
    </CurrencyProvider>
  );
}
