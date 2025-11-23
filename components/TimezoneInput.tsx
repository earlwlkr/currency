'use client';

import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { useAtom } from 'jotai';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
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
        if (!timezoneList.includes(selection)) {
          setTimezoneList([...timezoneList, selection]);
        }
      }}
      itemToString={(item) => (item ? item : '')}
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
      }) => (
        <div>
          <div
            className="inline-block mt-4"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input
              placeholder="Add another timezone..."
              className="text-lg"
              {...getInputProps({
                onKeyDown: (e) => {
                  if (inputValue) {
                    if (['Enter', 'Tab'].includes(e.key) && !highlightedIndex) {
                      e.preventDefault();
                      const options = getMatchingItems(
                        inputValue
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
          </div>

          {isOpen && inputValue ? (
            <ScrollArea
              {...getMenuProps()}
              className="mt-2 h-40 rounded-md border"
            >
              {getMatchingItems(inputValue).map(
                (item, index) => (
                  <div
                    key={item}
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
                    {item}
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
