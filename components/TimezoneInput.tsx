'use client';

import Downshift, {
  type DownshiftState,
  type StateChangeOptions,
} from 'downshift';
import { useAtom } from 'jotai';
import { Plus, Search, X } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { timezoneListAtom } from '@/lib/timezoneAtoms';
import {
  searchTimezones,
  type SearchResult,
} from '@/lib/timezoneUtils';
import { cn } from '@/lib/utils';

function stateReducer(
  _state: DownshiftState<SearchResult>,
  changes: StateChangeOptions<SearchResult>
) {
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return { ...changes, inputValue: '', isOpen: false };
    default:
      return changes;
  }
}

export const TimezoneInput = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);

  return (
    <Downshift<SearchResult>
      onChange={(selection) => {
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
            <div className="group flex min-h-16 items-center border-b border-border">
              <span className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-focus-within:border-primary group-focus-within:text-primary">
                <Plus className="h-4 w-4" />
              </span>
              <label className="sr-only" htmlFor="timezone-search">
                Search cities and timezones to add
              </label>
              <input
                placeholder="Add a city or timezone"
                className="h-16 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
                {...getInputProps({
                  id: 'timezone-search',
                  'aria-label': 'Search cities and timezones to add',
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
                  aria-label="Clear timezone search"
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
                    ? Math.min(matchingItems.length * 48 + 12, 256)
                    : 76,
                }}
              >
                {matchingItems.length > 0 ? (
                  matchingItems.map((item, index) => (
                    <div
                      key={`${item.id}-${item.label}`}
                      className={cn(
                        'flex cursor-default items-center justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors',
                        highlightedIndex === index && 'bg-accent text-accent-foreground'
                      )}
                      {...getItemProps({ index, item })}
                    >
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.sub}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No new timezones found
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
