'use client';

import { useAtom } from 'jotai';
import type { DateTimeFormatOptions } from 'intl';

import { timezoneListAtom } from '@/lib/timezoneAtoms';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { TimezoneInput } from './TimezoneInput';

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
              <TableCell className="font-medium">{timezone}</TableCell>
              <TableCell>{convertTimezone(new Date(), timezone)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TimezoneInput />
    </div>
  );
};
