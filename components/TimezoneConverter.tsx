'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useAtom } from 'jotai';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { TimezoneInput } from '@/components/TimezoneInput';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUrlParams } from '@/lib/urlParams';
import { comparisonTimeAtom, timezoneListAtom } from '@/lib/timezoneAtoms';
import { formatTimezone } from '@/lib/timezoneUtils';

const subscribeToClock = (onStoreChange: () => void) => {
  const interval = window.setInterval(onStoreChange, 30_000);
  return () => window.clearInterval(interval);
};

const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerMinuteSnapshot = () => 0;

const formatTime = (date: Date, timezone: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date);
  } catch {
    return '--:--';
  }
};

const getDateStamp = (date: Date, timezone?: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    ...(timezone ? { timeZone: timezone } : {}),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return Date.UTC(getPart('year'), getPart('month') - 1, getPart('day'));
};

const formatDayContext = (date: Date, timezone: string) => {
  const dayDifference = Math.round(
    (getDateStamp(date, timezone) - getDateStamp(date)) / 86_400_000
  );

  if (dayDifference === -1) return 'Yesterday';
  if (dayDifference === 0) return 'Today';
  if (dayDifference === 1) return 'Tomorrow';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getOffsetMinutes = (date: Date, timezone: string) => {
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  if (!offset || offset === 'GMT') return 0;
  const match = offset.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === '+' ? minutes : -minutes;
};

const formatRelativeOffset = (date: Date, timezone: string) => {
  const localOffset = -date.getTimezoneOffset();
  const difference = getOffsetMinutes(date, timezone) - localOffset;
  if (difference === 0) return 'Local time';

  const sign = difference > 0 ? '+' : '−';
  const absoluteMinutes = Math.abs(difference);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}h`;
};

const toLocalInputValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

export const TimezoneConverter = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);
  const [comparisonTimeValue, setComparisonTimeValue] = useAtom(comparisonTimeAtom);
  const currentMinute = useSyncExternalStore(
    subscribeToClock,
    getMinuteSnapshot,
    getServerMinuteSnapshot
  );
  const currentTime = new Date(currentMinute * 60_000);
  const selectedDate = comparisonTimeValue
    ? new Date(comparisonTimeValue)
    : null;
  const comparisonTime = selectedDate ?? currentTime;

  useEffect(() => {
    const params = getUrlParams();
    if (params?.timezones?.length) setTimezoneList(params.timezones);
    if (params?.comparisonTime) setComparisonTimeValue(params.comparisonTime);
  }, [setComparisonTimeValue, setTimezoneList]);

  const moveTimezone = (timezone: string, direction: -1 | 1) => {
    const currentIndex = timezoneList.indexOf(timezone);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= timezoneList.length) {
      return;
    }

    const nextList = [...timezoneList];
    [nextList[currentIndex], nextList[nextIndex]] = [
      nextList[nextIndex],
      nextList[currentIndex],
    ];
    setTimezoneList(nextList);
  };

  const removeTimezone = (timezone: string) => {
    if (timezoneList.length <= 1) return;
    setTimezoneList(timezoneList.filter((item) => item !== timezone));
  };

  return (
    <div className="min-w-0">
      <div className="flex items-end gap-3 border-b border-border pb-4">
        <div className="min-w-0 flex-1 sm:flex-none">
          <label
            htmlFor="comparison-time"
            className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Your local date & time
          </label>
          <input
            id="comparison-time"
            type="datetime-local"
            value={toLocalInputValue(comparisonTime)}
            onChange={(event) => {
              const nextDate = new Date(event.target.value);
              if (Number.isFinite(nextDate.getTime())) {
                setComparisonTimeValue(nextDate.toISOString());
              }
            }}
            className="numeric h-11 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
          />
        </div>
        <button
          type="button"
          onClick={() => setComparisonTimeValue(null)}
          disabled={selectedDate === null}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Now
        </button>
      </div>

      <div className="border-b border-border">
        {timezoneList.map((timezone, index) => {
          const formattedTimezone = formatTimezone(timezone, comparisonTime);
          return (
            <div
              key={timezone}
              className="row-enter grid min-h-[92px] grid-cols-[minmax(0,1fr)_auto_44px] items-center gap-3 border-t border-border/80 py-4 first:border-t-0"
            >
              <div className="min-w-0 pl-3">
                <p className="truncate text-sm font-bold">
                  {formattedTimezone.main}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {formattedTimezone.sub}
                </p>
              </div>

              <div className="text-right">
                <p className="numeric text-2xl font-semibold sm:text-3xl">
                  {formatTime(comparisonTime, timezone)}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {formatRelativeOffset(comparisonTime, timezone)} ·{' '}
                  {formatDayContext(comparisonTime, timezone)}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Open ${formattedTimezone.main} actions`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => moveTimezone(timezone, -1)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Move up
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => moveTimezone(timezone, 1)}
                    disabled={index === timezoneList.length - 1}
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Move down
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removeTimezone(timezone)}
                    disabled={timezoneList.length <= 1}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      <TimezoneInput />
    </div>
  );
};
