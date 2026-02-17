'use client';

import { useAtom } from 'jotai';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { DateTimeFormatOptions } from 'intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timezoneListAtom } from '@/lib/timezoneAtoms';
import { TimezoneInput } from './TimezoneInput';

import { formatTimezone } from '@/lib/timezoneUtils';

const convertTimezone = (date: Date, targetTimeZone: string) => {
  const options: DateTimeFormatOptions = {
    timeZone: targetTimeZone,
    hour: '2-digit',
    minute: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const formattedDate = formatter.format(date);

  return formattedDate;
};

export const TimezoneConverter = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);

  const handleRemove = (timezoneToRemove: string) => {
    setTimezoneList(timezoneList.filter((tz) => tz !== timezoneToRemove));
  };

  return (
    <div className="flex flex-col gap-y-2">
      {timezoneList.map((timezone) => (
        <div
          key={timezone}
          className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
        >
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium">
              {formatTimezone(timezone).main}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimezone(timezone).sub}
            </span>
          </div>
          <span className="text-lg font-medium tabular-nums pl-4 shrink-0">
            {convertTimezone(new Date(), timezone)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0"
                aria-label={`Open ${timezone} actions`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleRemove(timezone)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      <TimezoneInput />
    </div>
  );
};
