'use client';

import Downshift from 'downshift';
import { useAtom } from 'jotai';

import countryByCurrencyCode from '@/config/country-by-currency-code.json';
import { currencyListAtom } from '@/lib/atoms';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const AddCurrency = () => {
  const [currencyList, setCurrencyList] = useAtom(currencyListAtom);

  return (
    <Downshift
      onChange={(selection) => {
        if (!currencyList.includes(selection.currency_code)) {
          setCurrencyList([...currencyList, selection.currency_code]);
        }
      }}
      itemToString={(item) => (item ? item.currency_code : '')}
    >
      {({
        getInputProps,
        getItemProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
      }) => (
        <div>
          <div
            className="inline-block mt-4"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input placeholder="Add another currency..." {...getInputProps()} />
          </div>

          {isOpen && inputValue ? (
            <ScrollArea className="mt-2 h-40 rounded-md border">
              {countryByCurrencyCode
                .filter(
                  (item) =>
                    item.currency_code &&
                    (item.country
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()) ||
                      item.currency_code
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()))
                )
                .map((item, index) => (
                  <div
                    key={item.country + item.currency_code}
                    className={cn(
                      'p-2 mx-2 my-1 rounded-md',
                      highlightedIndex === index ? 'bg-slate-700' : '',
                      selectedItem === item ? 'bold' : ''
                    )}
                    {...getItemProps({
                      index,
                      item,
                    })}
                  >
                    {item.country} - {item.currency_code}
                  </div>
                ))}
            </ScrollArea>
          ) : null}
        </div>
      )}
    </Downshift>
  );
};

export { AddCurrency };
