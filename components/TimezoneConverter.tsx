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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TimezoneInput />
    </div>
  );
};
