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
            <h1 className="text-xl font-semibold">
              converter
            </h1>
            <ShareButton />
          </div>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium lowercase text-primary">
              <DollarSign className="h-3.5 w-3.5" />
              currency
            </h2>
            <CurrencyListOutput />
            <CurrencyInput />
          </section>

          <div className="border-t border-border/50" />

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium lowercase text-primary">
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
