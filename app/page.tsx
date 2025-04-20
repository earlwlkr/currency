import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const convertTimezone = (date: Date) => {
  const targetTimeZone = 'America/New_York';

  const options = {
    timeZone: targetTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    // timeZoneName: 'long',
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const formattedDate = formatter.format(date);

  return formattedDate;
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-4">
      <div className="w-full px-4 sm:w-1/4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Currency</AccordionTrigger>
            <AccordionContent>
              <CurrencyListOutput />
              <CurrencyInput />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Timezone</AccordionTrigger>
            <AccordionContent>{convertTimezone(new Date())}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
