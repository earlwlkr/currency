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
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');

  const resetStatus = () => {
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleShare = async () => {
    const url = generateShareableUrl({
      value: baseValue,
      currencies: currenciesList,
      timezones: timezoneList,
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Currency + Time',
          text: 'Open this currency and timezone setup.',
          url,
        });
        setStatus('shared');
        resetStatus();
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      resetStatus();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      // Fallback: select and copy manually if clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      setStatus(copied ? 'copied' : 'failed');
      resetStatus();
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      title="Share this setup"
      aria-live="polite"
    >
      {status === 'copied' || status === 'shared' ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {status === 'shared' ? 'Shared' : 'Copied'}
        </>
      ) : status === 'failed' ? (
        <>
          <Link2 className="h-3.5 w-3.5" />
          Copy failed
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
