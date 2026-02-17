'use client';

import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { Plus, X } from 'lucide-react';

import countryByCurrencyCode from '@/config/country-by-currency-code.json';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { useCurrencyContext } from '@/lib/CurrencyContext';

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

const CurrencyInput = () => {
  const { currenciesList, setCurrenciesList } = useCurrencyContext();
  const currencies = useRef(countryByCurrencyCode);

  return (
    <Downshift
      onChange={(selection) => {
        if (!selection) {
          return;
        }
        if (!currenciesList.includes(selection.currency_code)) {
          setCurrenciesList([...currenciesList, selection.currency_code]);
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
        clearSelection,
        highlightedIndex,
        selectedItem,
        selectItemAtIndex,
        setState,
      }) => (
        <div className="relative">
          <div
            className="mt-4"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <div className="relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Add another currency..."
                className="text-lg pl-9 pr-10"
                {...getInputProps({
                  onKeyDown: (e) => {
                    if (inputValue) {
                      if (['Enter', 'Tab'].includes(e.key) && !highlightedIndex) {
                        e.preventDefault();
                        const options = getMatchingItems(
                          inputValue,
                          currencies.current
                        );
                        if (options.length > 0) {
                          selectItemAtIndex(0);
                          clearSelection();
                        }
                      }
                    }
                  },
                })}
              />
              {inputValue ? (
                <button
                  type="button"
                  onClick={() => setState({ inputValue: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Clear currency input"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {isOpen && inputValue ? (
            <ScrollArea
              {...getMenuProps()}
              className="mt-2 h-40 rounded-lg border bg-popover text-popover-foreground shadow-lg z-50 absolute w-full"
            >
              {getMatchingItems(inputValue, currencies.current).map(
                (item, index) => (
                  <div
                    key={item.country + item.currency_code}
                    className={cn(
                      'px-3 py-2 mx-1 my-0.5 rounded-md cursor-default',
                      highlightedIndex === index ? 'bg-accent text-accent-foreground' : '',
                      selectedItem === item ? 'font-bold' : ''
                    )}
                    {...getItemProps({
                      index,
                      item,
                    })}
                  >
                    <span className="font-mono font-medium text-sm">{item.currency_code}</span>
                    <span className="text-muted-foreground text-sm ml-2">{item.country}</span>
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

export { CurrencyInput };
