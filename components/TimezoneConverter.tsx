'use client';

import { useAtom } from 'jotai';
import { useEffect, useSyncExternalStore } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { DateTimeFormatOptions } from 'intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timezoneListAtom } from '@/lib/timezoneAtoms';
import { TimezoneInput } from './TimezoneInput';
import { getUrlParams } from '@/lib/urlParams';

import { formatTimezone } from '@/lib/timezoneUtils';

const convertTimezone = (date: Date, targetTimeZone: string) => {
  try {
    const options: DateTimeFormatOptions = {
      timeZone: targetTimeZone,
      hour: '2-digit',
      minute: '2-digit',
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    return formatter.format(date);
  } catch {
    return '--:--';
  }
};

const subscribeToClock = (onStoreChange: () => void) => {
  const interval = window.setInterval(onStoreChange, 30_000);
  return () => window.clearInterval(interval);
};

const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerMinuteSnapshot = () => 0;

export const TimezoneConverter = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);
  const currentMinute = useSyncExternalStore(
    subscribeToClock,
    getMinuteSnapshot,
    getServerMinuteSnapshot
  );
  const currentTime = new Date(currentMinute * 60_000);

  // Read timezones from URL params on mount
  useEffect(() => {
    const params = getUrlParams();
    if (params?.timezones && params.timezones.length > 0) {
      setTimezoneList(params.timezones);
    }
  }, [setTimezoneList]);

  const handleRemove = (timezoneToRemove: string) => {
    setTimezoneList(timezoneList.filter((tz) => tz !== timezoneToRemove));
  };

  return (
    <div className="flex flex-col">
      {timezoneList.map((timezone) => (
        <div
          key={timezone}
          className="row-enter flex items-center justify-between border-b border-border/60 py-3 pl-2 transition-colors hover:bg-muted/35"
        >
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium">
              {formatTimezone(timezone).main}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimezone(timezone).sub}
            </span>
          </div>
          <span className="shrink-0 pl-4 text-lg font-semibold tabular-nums tracking-tight">
            {convertTimezone(currentTime, timezone)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={`Open ${timezone} actions`}
              >
                <MoreHorizontal className="h-4 w-4" />
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
