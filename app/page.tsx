'use client';

import { CurrencyInput } from '@/components/CurrencyInput';
import { CurrencyListOutput } from '@/components/CurrencyListOutput';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { baseAccordionAtom } from '@/lib/atoms';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { useAtom } from 'jotai';

export default function Home() {
  const [baseAccordion, setBaseAccordion] = useAtom(baseAccordionAtom);

  return (
    <main className="flex min-h-screen flex-col items-center pt-4">
      <div className="w-full px-4 sm:w-1/2">
        <Accordion
          type="single"
          collapsible
          defaultValue={baseAccordion}
          onValueChange={(value) => {
            setBaseAccordion(value);
          }}
          className="w-full"
        >
          <AccordionItem value="currency">
            <AccordionTrigger className="px-1">Currency</AccordionTrigger>
            <AccordionContent className="px-1">
              <CurrencyProvider>
                <CurrencyListOutput />
                <CurrencyInput />
              </CurrencyProvider>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="timezone">
            <AccordionTrigger className="px-1">Timezone</AccordionTrigger>
            <AccordionContent className="px-1">
              <TimezoneConverter />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
