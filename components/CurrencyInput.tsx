'use client';

import { Input } from '@/components/ui/input';
import { baseValueAtom } from '@/lib/atoms';
import { useAtom } from 'jotai';

const CurrencyInput = () => {
  const [value, setValue] = useAtom(baseValueAtom);
  return (
    <Input
      type="number"
      placeholder="Base currency"
      defaultValue={value}
      onChange={(e) => setValue(Number(e.target.value))}
    />
  );
};

export { CurrencyInput };
