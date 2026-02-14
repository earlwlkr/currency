'use client';

import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { useAtom } from 'jotai';
import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timezoneListAtom } from '@/lib/timezoneAtoms';

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

import { searchTimezones } from '@/lib/timezoneUtils';

function getMatchingItems(inputValue: string) {
  return searchTimezones(inputValue);
}

export const TimezoneInput = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);

  return (
    <Downshift
      onChange={(selection) => {
        if (!selection) {
          return;
        }
        if (!timezoneList.includes(selection.id)) {
          setTimezoneList([...timezoneList, selection.id]);
        }
      }}
      itemToString={(item) => (item ? item.label : '')}
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
        setInputValue,
      }) => (
        <div>
          <div
            className="inline-block mt-4"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <div className="relative w-[300px]">
              <Input
                placeholder="Add another timezone..."
                className="text-lg w-[300px] pr-10"
                {...getInputProps({
                  onKeyDown: (e) => {
                    if (inputValue) {
                      if (['Enter', 'Tab'].includes(e.key) && !highlightedIndex) {
                        e.preventDefault();
                        const options = getMatchingItems(inputValue);
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
                  onClick={() => setInputValue('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear timezone input"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {isOpen && inputValue ? (
            <ScrollArea
              {...getMenuProps()}
              className="mt-2 h-60 rounded-md border bg-popover text-popover-foreground shadow-md z-50 absolute w-[300px]"
            >
              {getMatchingItems(inputValue).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={cn(
                    'p-2 mx-2 my-1 rounded-md cursor-default',
                    highlightedIndex === index
                      ? 'bg-accent text-accent-foreground'
                      : '',
                    selectedItem === item ? 'font-bold' : ''
                  )}
                  {...getItemProps({
                    index,
                    item,
                  })}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : null}
        </div>
      )}
    </Downshift>
  );
};
