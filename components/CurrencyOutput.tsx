'use client';

import { useAtom } from 'jotai';
import { GripVertical, Trash2 } from 'lucide-react';

import { baseCurrencyAtom, baseValueAtom, currencyListAtom } from '@/lib/atoms';
import { convert } from '@/lib/currency';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const CurrencyOutput = () => {
  const [baseValue, setBaseValue] = useAtom(baseValueAtom);
  const [baseCurrency, setBaseCurrency] = useAtom(baseCurrencyAtom);
  const [currencyList, setCurrencyList] = useAtom(currencyListAtom);

  return (
    <div className="flex flex-col gap-y-2">
      {currencyList.map((currency) => (
        <div key={currency}>
          <Label htmlFor={currency}>{currency}</Label>
          <div className="flex items-center">
            <Input
              key={currency}
              id={currency}
              value={convert(baseValue, baseCurrency, currency)}
              autoComplete="off"
              onChange={(e) => {
                setBaseCurrency(currency);
                const value = Number(e.target.value.replace(/[^0-9.-]+/g, ''));
                if (!isNaN(value)) setBaseValue(value);
              }}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <GripVertical className="h-8 w-8 ml-2 px-1 rounded-md cursor-pointer hover:bg-slate-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setCurrencyList(currencyList.filter((c) => c !== currency));
                    if (baseCurrency === currency) {
                      setBaseCurrency(currencyList[0]);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

export { CurrencyOutput };
