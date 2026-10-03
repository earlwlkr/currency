'use client';

import Downshift, {
  type DownshiftState,
  type StateChangeOptions,
} from 'downshift';
import { Plus, X } from 'lucide-react';

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

// Every selection (click, Enter, or the first-match shortcut) adds the item
// and resets the search. Downshift keeps no selection of its own, so blurring
// can't restore the last pick and the same item can be added again later.
function stateReducer(
  _state: DownshiftState<CurrencyOption>,
  changes: StateChangeOptions<CurrencyOption>
) {
  if (!changes.selectedItem) return changes;
  return { ...changes, selectedItem: null, inputValue: '', isOpen: false };
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
      onSelect={(selection) => {
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
            <div className="flex h-14 items-center gap-3 border-y border-border">
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label className="sr-only" htmlFor="currency-search">
                Search currencies to add
              </label>
              <input
                placeholder="Add currency"
                className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground focus-visible:outline-none"
                {...getInputProps({
                  id: 'currency-search',
                  'aria-label': 'Search currencies to add',
                  autoComplete: 'off',
                  autoCapitalize: 'characters',
                  spellCheck: false,
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
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear currency search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div
              {...getMenuProps()}
              className={cn(
                'absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg',
                (!isOpen || !inputValue) && 'hidden'
              )}
            >
              <ScrollArea
                className="p-1"
                style={{
                  height: matchingItems.length
                    ? Math.min(matchingItems.length * 44 + 8, 272)
                    : 52,
                }}
              >
                {matchingItems.length > 0 ? (
                  matchingItems.map((item, index) => (
                    <div
                      key={item.currency_code}
                      className={cn(
                        'flex h-11 cursor-default items-center gap-3 rounded-md px-3',
                        highlightedIndex === index && 'bg-accent text-accent-foreground'
                      )}
                      {...getItemProps({ index, item })}
                    >
                      <span className="w-10 shrink-0 text-[15px] font-semibold">
                        {item.currency_code}
                      </span>
                      <span className="truncate text-[13px] text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-3 text-[13px] text-muted-foreground">
                    No matching currencies
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
