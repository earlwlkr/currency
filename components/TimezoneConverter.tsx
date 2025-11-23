'use client';

import { useAtom } from 'jotai';
import { Trash2 } from 'lucide-react';
import type { DateTimeFormatOptions } from 'intl';

import { timezoneListAtom } from '@/lib/timezoneAtoms';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { TimezoneInput } from './TimezoneInput';

import { formatTimezone } from '@/lib/timezoneUtils';

const convertTimezone = (date: Date, targetTimeZone: string) => {
  // const targetTimeZone = 'America/New_York';

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
      <Table>
        <TableBody>
          {timezoneList.map((timezone) => (
            <TableRow key={timezone}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-bold">{formatTimezone(timezone).main}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimezone(timezone).sub}
                  </span>
                </div>
              </TableCell>
              <TableCell>{convertTimezone(new Date(), timezone)}</TableCell>
              <TableCell>
                <button
                  onClick={() => handleRemove(timezone)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label={`Remove ${timezone}`}
                >
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TimezoneInput />
    </div>
  );
};
