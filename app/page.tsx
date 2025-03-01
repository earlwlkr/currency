import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-4">
      <div className="w-full px-4 sm:w-1/4">
        <CurrencyListOutput />
      </div>
      <div className="w-full px-4 sm:w-1/4">
        <CurrencyInput />
      </div>
    </main>
  );
}
