'use client';

import { DollarSign, Clock } from 'lucide-react';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { ShareButton } from '@/components/ShareButton';

export default function Home() {
  return (
    <CurrencyProvider>
      <main className="flex min-h-screen flex-col items-center py-6">
        <div className="w-full max-w-xl px-4 space-y-6">
          {/* Header with Share */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              converter
            </h1>
            <ShareButton />
          </div>

          <section>
            <h2 className="text-xs font-medium tracking-[0.15em] lowercase text-primary mb-3 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5" />
              currency
            </h2>
            <CurrencyListOutput />
            <CurrencyInput />
          </section>

          <div className="border-t border-border/50" />

          <section>
            <h2 className="text-xs font-medium tracking-[0.15em] lowercase text-primary mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              timezone
            </h2>
            <TimezoneConverter />
          </section>
        </div>
      </main>
    </CurrencyProvider>
  );
}
