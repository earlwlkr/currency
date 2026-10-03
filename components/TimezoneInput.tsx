'use client';

import Downshift, {
  type DownshiftState,
  type StateChangeOptions,
} from 'downshift';
import { useAtom } from 'jotai';
import { Plus, X } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { timezoneListAtom } from '@/lib/timezoneAtoms';
import {
  searchTimezones,
  type SearchResult,
} from '@/lib/timezoneUtils';
import { cn } from '@/lib/utils';

// Every selection (click, Enter, or the first-match shortcut) adds the item
// and resets the search. Downshift keeps no selection of its own, so blurring
// can't restore the last pick and the same item can be added again later.
function stateReducer(
  _state: DownshiftState<SearchResult>,
  changes: StateChangeOptions<SearchResult>
) {
  if (!changes.selectedItem) return changes;
  return { ...changes, selectedItem: null, inputValue: '', isOpen: false };
}

export const TimezoneInput = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);

  return (
    <Downshift<SearchResult>
      onSelect={(selection) => {
        if (!selection || timezoneList.includes(selection.id)) return;
        setTimezoneList([...timezoneList, selection.id]);
      }}
      itemToString={(item) => item?.label ?? ''}
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
        const matchingItems = (inputValue ? searchTimezones(inputValue) : [])
          .filter((item) => !timezoneList.includes(item.id))
          .slice(0, 30);

        return (
          <div className="relative" {...getRootProps({}, { suppressRefError: true })}>
            <div className="flex h-14 items-center gap-3 border-y border-border">
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label className="sr-only" htmlFor="timezone-search">
                Search cities and time zones to add
              </label>
              <input
                placeholder="Add city or time zone"
                className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground focus-visible:outline-none"
                {...getInputProps({
                  id: 'timezone-search',
                  'aria-label': 'Search cities and time zones to add',
                  autoComplete: 'off',
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
                  aria-label="Clear time zone search"
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
                      key={`${item.id}-${item.label}`}
                      className={cn(
                        'flex h-11 cursor-default items-center justify-between gap-4 rounded-md px-3',
                        highlightedIndex === index && 'bg-accent text-accent-foreground'
                      )}
                      {...getItemProps({ index, item })}
                    >
                      <span className="min-w-0 truncate text-[15px]">
                        {item.label}
                      </span>
                      <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                        {item.sub}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-3 text-[13px] text-muted-foreground">
                    No matching cities or time zones
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
