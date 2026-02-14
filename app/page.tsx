'use client';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import { CurrencyProvider } from '@/lib/CurrencyContext';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-4">
      <div className="w-full px-4 sm:w-1/2 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Currency</h2>
          <CurrencyProvider>
            <CurrencyListOutput />
            <CurrencyInput />
          </CurrencyProvider>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Timezone</h2>
          <TimezoneConverter />
        </section>
      </div>
    </main>
  );
}
