import { AddCurrency } from '@/components/AddCurrency';
import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyOutput } from '@/components/CurrencyOutput';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-4">
      <div className="w-full px-4 sm:w-1/2">
        <CurrencyInput />
      </div>
      <div className="w-full px-4 sm:w-1/2">
        <CurrencyOutput />
      </div>
      <div className="w-full px-4 sm:w-1/2">
        <AddCurrency />
      </div>
    </main>
  );
}
