'use client';

import { useAtom } from 'jotai';
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

  return (
    <div className="flex flex-col gap-y-2">
      <Table>
        <TableBody>
          {timezoneList.map((timezone) => (
            <TableRow key={timezone}>
              {/* import {formatTimezone} from '@/lib/timezoneUtils'; */}

              {/* ... */}

              <TableCell className="font-medium">{formatTimezone(timezone)}</TableCell>
              <TableCell>{convertTimezone(new Date(), timezone)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TimezoneInput />
    </div>
  );
};
