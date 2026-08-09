'use client';

import { useMemo } from 'react';
import Downshift, {
  type DownshiftState,
  type StateChangeOptions,
} from 'downshift';
import { Plus, Search, X } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import countryByCurrencyCode from '@/config/country-by-currency-code.json';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { formatCurrencyName } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';

interface CurrencyOption {
  currency_code: string;
  name: string;
}

const currencyOptions: CurrencyOption[] = Array.from(
  new Set(
    countryByCurrencyCode
      .map((item) => item.currency_code)
      .filter(
        (currencyCode): currencyCode is string =>
          typeof currencyCode === 'string' && currencyCode.length === 3
      )
  )
)
  .map((currencyCode) => ({
    currency_code: currencyCode,
    name: formatCurrencyName(currencyCode),
  }))
  .sort((a, b) => a.currency_code.localeCompare(b.currency_code));

function stateReducer(
  _state: DownshiftState<CurrencyOption>,
  changes: StateChangeOptions<CurrencyOption>
) {
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return { ...changes, inputValue: '', isOpen: false };
    default:
      return changes;
  }
}

function getMatchingItems(
  inputValue: string,
  selectedCurrencies: string[]
) {
  const query = inputValue.trim().toLowerCase();
  if (!query) return [];

  return currencyOptions
    .filter(
      (item) =>
        !selectedCurrencies.includes(item.currency_code) &&
        (item.currency_code.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query))
    )
    .slice(0, 30);
}

const CurrencyInput = () => {
  const { currenciesList, setCurrenciesList } = useCurrencyContext();

  return (
    <Downshift<CurrencyOption>
      onChange={(selection) => {
        if (!selection || currenciesList.includes(selection.currency_code)) {
          return;
        }
        setCurrenciesList([...currenciesList, selection.currency_code]);
      }}
      itemToString={(item) => item?.currency_code ?? ''}
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
        selectItemAtIndex,
        setState,
      }) => {
        const matchingItems = getMatchingItems(
          inputValue ?? '',
          currenciesList
        );

        return (
          <div className="relative" {...getRootProps({}, { suppressRefError: true })}>
            <div className="group flex min-h-16 items-center border-b border-border">
              <span className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-focus-within:border-primary group-focus-within:text-primary">
                <Plus className="h-4 w-4" />
              </span>
              <label className="sr-only" htmlFor="currency-search">
                Search currencies to add
              </label>
              <input
                placeholder="Add a currency"
                className="h-16 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
                {...getInputProps({
                  id: 'currency-search',
                  'aria-label': 'Search currencies to add',
                  onKeyDown: (event) => {
                    if (
                      (event.key === 'Enter' || event.key === 'Tab') &&
                      inputValue &&
                      highlightedIndex === null &&
                      matchingItems.length > 0
                    ) {
                      event.preventDefault();
                      selectItemAtIndex(0);
                    }
                  },
                })}
              />
              {inputValue ? (
                <button
                  type="button"
                  onClick={() => setState({ inputValue: '' })}
                  className="mr-1 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear currency search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Search className="mr-4 h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
              )}
            </div>

            <div
              {...getMenuProps()}
              className={cn(
                'absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-[0_18px_50px_rgba(20,20,16,0.16)]',
                (!isOpen || !inputValue) && 'hidden'
              )}
            >
              <ScrollArea
                className="p-1.5"
                style={{
                  height: matchingItems.length
                    ? Math.min(matchingItems.length * 40 + 12, 256)
                    : 76,
                }}
              >
                {matchingItems.length > 0 ? (
                  matchingItems.map((item, index) => (
                    <div
                      key={item.currency_code}
                      className={cn(
                        'flex cursor-default items-center justify-between rounded-lg px-3 py-2.5 transition-colors',
                        highlightedIndex === index && 'bg-accent text-accent-foreground'
                      )}
                      {...getItemProps({ index, item })}
                    >
                      <span className="text-sm font-bold tracking-[0.04em]">
                        {item.currency_code}
                      </span>
                      <span className="ml-4 truncate text-xs text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No new currencies found
                  </p>
                )}
              </ScrollArea>
            </div>
          </div>
        );
      }}
    </Downshift>
  );
};

export { CurrencyInput };
