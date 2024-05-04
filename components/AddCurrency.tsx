'use client';

import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { useAtom } from 'jotai';

import countryByCurrencyCode from '@/config/country-by-currency-code.json';
import { currencyListAtom } from '@/lib/atoms';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function stateReducer(
  state: DownshiftState<any>,
  changes: StateChangeOptions<any>
) {
  // this prevents the menu from being closed when the user
  // selects an item with a keyboard or mouse
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return {
        ...changes,
        inputValue: '',
      };
    default:
      return changes;
  }
}

function getMatchingItems(
  inputValue: string,
  items: typeof countryByCurrencyCode
) {
  if (!inputValue) {
    return items;
  }
  return items.filter(
    (item) =>
      item.currency_code &&
      (item.country.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.currency_code.toLowerCase().includes(inputValue.toLowerCase()))
  );
}

const AddCurrency = () => {
  const [currencyList, setCurrencyList] = useAtom(currencyListAtom);

  return (
    <Downshift
      onChange={(selection) => {
        if (!selection) {
          return;
        }
        if (!currencyList.includes(selection.currency_code)) {
          setCurrencyList([...currencyList, selection.currency_code]);
        }
      }}
      itemToString={(item) => (item ? item.currency_code : '')}
      stateReducer={stateReducer}
    >
      {({
        getRootProps,
        getInputProps,
        getMenuProps,
        getItemProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        selectItemAtIndex,
      }) => (
        <div>
          <div
            className="inline-block mt-4"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input
              placeholder="Add another currency..."
              {...getInputProps({
                onKeyDown: (e) => {
                  if (e.key === 'Enter' && inputValue && !highlightedIndex) {
                    const options = getMatchingItems(
                      inputValue,
                      countryByCurrencyCode
                    );
                    if (options.length > 0) {
                      selectItemAtIndex(0);
                    }
                  }
                },
              })}
            />
          </div>

          {isOpen && inputValue ? (
            <ScrollArea
              {...getMenuProps()}
              className="mt-2 h-40 rounded-md border"
            >
              {getMatchingItems(inputValue, countryByCurrencyCode).map(
                (item, index) => (
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
                )
              )}
            </ScrollArea>
          ) : null}
        </div>
      )}
    </Downshift>
  );
};

export { AddCurrency };
