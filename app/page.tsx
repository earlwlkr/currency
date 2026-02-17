'use client';

import { DollarSign, Clock } from 'lucide-react';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import { CurrencyProvider } from '@/lib/CurrencyContext';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center py-12">
      <div className="w-full max-w-xl px-5 space-y-10">
        <section>
          <h2 className="text-xs font-mono font-medium tracking-[0.15em] lowercase text-primary mb-5 flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            currency
          </h2>
          <CurrencyProvider>
            <CurrencyListOutput />
            <CurrencyInput />
          </CurrencyProvider>
        </section>

        <div className="border-t border-border/50" />

        <section>
          <h2 className="text-xs font-mono font-medium tracking-[0.15em] lowercase text-primary mb-5 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            timezone
          </h2>
          <TimezoneConverter />
        </section>
      </div>
    </main>
  );
}
