'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { useAtom } from 'jotai';

import { useCurrencyContext } from '@/lib/CurrencyContext';
import { timezoneListAtom } from '@/lib/timezoneAtoms';
import { generateShareableUrl } from '@/lib/urlParams';

export function ShareButton() {
  const { baseValue, currenciesList } = useCurrencyContext();
  const [timezoneList] = useAtom(timezoneListAtom);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareableUrl({
      value: baseValue,
      currencies: currenciesList,
      timezones: timezoneList,
    });

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy manually if clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      title="Copy shareable link"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" />
          Share
        </>
      )}
    </button>
  );
}
