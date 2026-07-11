'use client';

import { useState, useSyncExternalStore } from 'react';
import { Clock3, Coins } from 'lucide-react';
import { useAtom } from 'jotai';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { ShareButton } from '@/components/ShareButton';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import { TimezoneGlobe } from '@/components/TimezoneGlobe';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { timezoneListAtom } from '@/lib/timezoneAtoms';
import { cn } from '@/lib/utils';

type Workspace = 'currency' | 'time';

const subscribeToHydration = () => () => undefined;

function ConverterWorkspace() {
  const [timezoneList] = useAtom(timezoneListAtom);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>('currency');

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Travel utility
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Currency + Time
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live rates and local hours, together.
            </p>
          </div>
          <ShareButton />
        </header>

        <nav
          className="my-4 grid grid-cols-2 rounded-xl bg-muted p-1 md:hidden"
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
                'flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-all',
                activeWorkspace === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={activeWorkspace === value}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="grid items-start gap-12 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] md:pt-8 lg:gap-20">
          <section
            className={cn(
              'workspace-enter min-w-0',
              activeWorkspace !== 'currency' && 'hidden md:block'
            )}
            aria-labelledby="currency-heading"
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Convert
                </p>
                <h2 id="currency-heading" className="mt-1 text-xl font-semibold tracking-tight">
                  Selected currencies
                </h2>
              </div>
              <p className="hidden max-w-48 text-right text-xs leading-relaxed text-muted-foreground sm:block">
                Edit any amount to make it the base.
              </p>
            </div>
            <CurrencyListOutput />
            <CurrencyInput />
          </section>

          <section
            className={cn(
              'workspace-enter min-w-0 md:border-l md:border-border/70 md:pl-10 lg:pl-16',
              activeWorkspace !== 'time' && 'hidden md:block'
            )}
            aria-labelledby="time-heading"
          >
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Compare
              </p>
              <h2 id="time-heading" className="mt-1 text-xl font-semibold tracking-tight">
                Local time
              </h2>
            </div>
            <TimezoneGlobe timezoneList={timezoneList} />
            <TimezoneConverter />
          </section>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  if (!isHydrated) {
    return <main className="min-h-svh bg-background" aria-hidden="true" />;
  }

  return (
    <CurrencyProvider>
      <ConverterWorkspace />
    </CurrencyProvider>
  );
}
