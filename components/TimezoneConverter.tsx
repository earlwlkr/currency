'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAtom } from 'jotai';
import { ChevronDown } from 'lucide-react';

import { RowActions } from '@/components/RowActions';
import { TimezoneInput } from '@/components/TimezoneInput';
import { getUrlParams } from '@/lib/urlParams';
import { comparisonTimeAtom, timezoneListAtom } from '@/lib/timezoneAtoms';
import { formatTimezone } from '@/lib/timezoneUtils';
import { cn, selectAllOnFocus } from '@/lib/utils';

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

// Midnight (as a UTC timestamp) of the calendar day `date` falls on in
// `timezone`, or in the local timezone when omitted.
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

const formatDayLabel = (date: Date, today: Date, timezone?: string) => {
  const dayDifference = Math.round(
    (getDateStamp(date, timezone) - getDateStamp(today)) / 86_400_000
  );

  if (dayDifference === -1) return 'Yesterday';
  if (dayDifference === 0) return 'Today';
  if (dayDifference === 1) return 'Tomorrow';

  return new Intl.DateTimeFormat('en-US', {
    ...(timezone ? { timeZone: timezone } : {}),
    weekday: 'short',
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
  if (difference === 0) return 'your time';

  const absoluteMinutes = Math.abs(difference);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  const amount = [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '']
    .filter(Boolean)
    .join(' ');
  return `${amount} ${difference > 0 ? 'ahead' : 'behind'}`;
};

// Accepts 9, 930, 0930, 9:30, 21:05, 9pm, 9:30 am.
const parseTimeInput = (value: string) => {
  const match = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .match(/^(\d{1,2})(?:[:.h]?(\d{2}))?(am?|pm?)?$/);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridiem = match[3];
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem.startsWith('p') ? 12 : 0);
  }
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
};

// Converts a wall-clock time in `timezone` (expressed as a UTC timestamp) to
// the actual instant, re-checking the offset in case it crosses a DST change.
const zonedTimeToDate = (wallClock: number, timezone: string) => {
  const offset = getOffsetMinutes(new Date(wallClock), timezone);
  let result = wallClock - offset * 60_000;
  const correctedOffset = getOffsetMinutes(new Date(result), timezone);
  if (correctedOffset !== offset) {
    result = wallClock - correctedOffset * 60_000;
  }
  return new Date(result);
};

const toLocalDateValue = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const TimezoneConverter = () => {
  const [timezoneList, setTimezoneList] = useAtom(timezoneListAtom);
  const [comparisonTimeValue, setComparisonTimeValue] = useAtom(comparisonTimeAtom);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [invalidTimezone, setInvalidTimezone] = useState<string | null>(null);
  const skipBlurCommitRef = useRef<string | null>(null);
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

  const clearDraft = (timezone: string) => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[timezone];
      return next;
    });
  };

  const commitTime = (timezone: string) => {
    const draft = drafts[timezone];
    if (draft === undefined) return;

    const parsed = parseTimeInput(draft);
    if (!parsed) {
      setInvalidTimezone(timezone);
      return;
    }

    const wallClock =
      getDateStamp(comparisonTime, timezone) +
      parsed.hours * 3_600_000 +
      parsed.minutes * 60_000;
    setComparisonTimeValue(zonedTimeToDate(wallClock, timezone).toISOString());
    setInvalidTimezone(null);
    clearDraft(timezone);
  };

  const handleDateChange = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return;

    const nextDate = new Date(
      year,
      month - 1,
      day,
      comparisonTime.getHours(),
      comparisonTime.getMinutes()
    );
    if (Number.isFinite(nextDate.getTime())) {
      setComparisonTimeValue(nextDate.toISOString());
    }
  };

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
      <div className="flex min-h-10 items-center justify-between gap-3 pb-2 text-[13px]">
        <div className="relative -ml-2">
          <input
            id="comparison-date"
            type="date"
            value={toLocalDateValue(comparisonTime)}
            onChange={(event) => handleDateChange(event.target.value)}
            onClick={(event) => {
              try {
                event.currentTarget.showPicker();
              } catch {
                // Browsers without showPicker open the picker natively on tap.
              }
            }}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Date to compare"
          />
          <span
            className="pointer-events-none flex h-10 items-center gap-1 rounded-md px-2 font-medium transition-colors peer-hover:bg-muted peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring"
            aria-hidden="true"
          >
            {formatDayLabel(comparisonTime, currentTime)}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </div>
        {selectedDate ? (
          <button
            type="button"
            onClick={() => {
              setComparisonTimeValue(null);
              setDrafts({});
              setInvalidTimezone(null);
            }}
            className="-mr-2 h-10 rounded-md px-2 font-medium transition-colors hover:bg-muted"
          >
            Reset to now
          </button>
        ) : null}
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {timezoneList.map((timezone, index) => {
          const formattedTimezone = formatTimezone(timezone, comparisonTime);
          const abbreviation = formattedTimezone.abbreviation.replace(
            /^GMT(?=[+-])/,
            'UTC'
          );
          const relativeOffset = formatRelativeOffset(comparisonTime, timezone);
          const isOtherDay =
            getDateStamp(comparisonTime, timezone) !==
            getDateStamp(comparisonTime);
          const isInvalid = invalidTimezone === timezone;

          return (
            <li
              key={timezone}
              className="group grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-3 py-3"
            >
              <div className="min-w-0 pt-2.5">
                <p className="truncate text-[15px] font-semibold leading-5">
                  {formattedTimezone.main}
                </p>
                <p className="truncate text-[13px] leading-5 text-muted-foreground">
                  {abbreviation ? `${abbreviation}, ${relativeOffset}` : relativeOffset}
                </p>
              </div>

              <div className="text-right">
                <label className="sr-only" htmlFor={`time-${timezone}`}>
                  Time in {formattedTimezone.main}
                </label>
                <input
                  id={`time-${timezone}`}
                  className={cn(
                    'h-10 w-24 rounded-md bg-transparent px-1 text-right text-[28px] font-normal tabular-nums tracking-tight caret-primary outline-none transition-colors hover:bg-muted/60 focus:bg-muted focus:shadow-[inset_0_-2px_0_hsl(var(--primary))] focus-visible:outline-none',
                    isInvalid &&
                      'shadow-[inset_0_-2px_0_hsl(var(--destructive))] focus:shadow-[inset_0_-2px_0_hsl(var(--destructive))]'
                  )}
                  value={drafts[timezone] ?? formatTime(comparisonTime, timezone)}
                  inputMode="numeric"
                  autoComplete="off"
                  enterKeyHint="done"
                  title={`Type a time in ${formattedTimezone.main}`}
                  {...selectAllOnFocus}
                  onChange={(event) => {
                    const { value } = event.target;
                    setDrafts((current) => ({ ...current, [timezone]: value }));
                    setInvalidTimezone(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }
                    if (event.key === 'Escape') {
                      skipBlurCommitRef.current = timezone;
                      clearDraft(timezone);
                      setInvalidTimezone(null);
                      event.currentTarget.blur();
                    }
                  }}
                  onBlur={() => {
                    if (skipBlurCommitRef.current === timezone) {
                      skipBlurCommitRef.current = null;
                      return;
                    }
                    commitTime(timezone);
                  }}
                  aria-invalid={isInvalid}
                  aria-describedby={isInvalid ? `time-${timezone}-error` : undefined}
                />
                {isInvalid ? (
                  <p
                    id={`time-${timezone}-error`}
                    className="whitespace-nowrap pr-1 text-[13px] leading-7 text-destructive"
                    role="alert"
                  >
                    Use a time like 9:30
                  </p>
                ) : (
                  <p className="h-7 pr-1 text-[13px] leading-7 text-muted-foreground">
                    {isOtherDay
                      ? formatDayLabel(comparisonTime, currentTime, timezone)
                      : null}
                  </p>
                )}
              </div>

              <RowActions
                label={formattedTimezone.main}
                index={index}
                count={timezoneList.length}
                onMove={(direction) => moveTimezone(timezone, direction)}
                onRemove={() => removeTimezone(timezone)}
              />
            </li>
          );
        })}
      </ul>

      <TimezoneInput />
    </div>
  );
};
