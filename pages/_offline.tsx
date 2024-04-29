import { AddCurrency } from '@/components/AddCurrency';
import { CurrencyOutput } from '@/components/CurrencyOutput';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-4">
      <div className="w-full px-4 sm:w-1/4">
        <CurrencyOutput />
      </div>
      <div className="w-full px-4 sm:w-1/4">
        <AddCurrency />
      </div>
    </main>
  );
}
