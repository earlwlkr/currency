'use client';

import { useEffect, useState } from 'react';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { ShareButton } from '@/components/ShareButton';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { getUrlParams } from '@/lib/urlParams';
import { cn } from '@/lib/utils';

type Workspace = 'currency' | 'time';

const WORKSPACES: { value: Workspace; label: string }[] = [
  { value: 'currency', label: 'Currency' },
  { value: 'time', label: 'Time' },
];

// A shared link decides the workspace; otherwise reopen the last one used.
const getInitialWorkspace = (): Workspace => {
  const sharedWorkspace = getUrlParams()?.workspace;
  if (sharedWorkspace) return sharedWorkspace;
  try {
    return localStorage.getItem('workspace') === 'time' ? 'time' : 'currency';
  } catch {
    return 'currency';
  }
};

function ConverterWorkspace() {
  const [activeWorkspace, setActiveWorkspace] =
    useState<Workspace>(getInitialWorkspace);

  useEffect(() => {
    try {
      localStorage.setItem('workspace', activeWorkspace);
    } catch {
      // Switching still works when storage is unavailable.
    }
  }, [activeWorkspace]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] sm:px-6 sm:pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="flex h-16 items-center justify-between gap-4">
        <nav className="-ml-2 flex items-center" aria-label="Converter">
          {WORKSPACES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveWorkspace(value)}
              className={cn(
                'h-11 rounded-md px-2 text-xl font-semibold tracking-tight transition-colors',
                activeWorkspace === value
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={activeWorkspace === value}
            >
              {label}
            </button>
          ))}
        </nav>
        <ShareButton workspace={activeWorkspace} />
      </header>

      <main>
        <section
          hidden={activeWorkspace !== 'currency'}
          aria-label="Currency converter"
        >
          <CurrencyListOutput />
          <CurrencyInput />
        </section>

        <section hidden={activeWorkspace !== 'time'} aria-label="Time converter">
          <TimezoneConverter />
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsHydrated(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isHydrated) {
    return <div className="min-h-svh" aria-busy="true" />;
  }

  return (
    <CurrencyProvider>
      <ConverterWorkspace />
    </CurrencyProvider>
  );
}
