'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { useAtom } from 'jotai';

import { useCurrencyContext } from '@/lib/CurrencyContext';
import { comparisonTimeAtom, timezoneListAtom } from '@/lib/timezoneAtoms';
import { generateShareableUrl } from '@/lib/urlParams';

interface ShareButtonProps {
  workspace: 'currency' | 'time';
}

export function ShareButton({ workspace }: ShareButtonProps) {
  const { baseCurrency, baseValue, currenciesList } = useCurrencyContext();
  const [timezoneList] = useAtom(timezoneListAtom);
  const [comparisonTime] = useAtom(comparisonTimeAtom);
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');

  const resetStatus = () => {
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleShare = async () => {
    const url = generateShareableUrl({
      value: baseValue,
      baseCurrency,
      currencies: currenciesList,
      timezones: timezoneList,
      comparisonTime,
      workspace,
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
      className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-border/80 px-3 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-muted sm:px-4"
      title="Share this setup"
      aria-label="Share current setup"
      aria-live="polite"
    >
      {status === 'copied' || status === 'shared' ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{status === 'shared' ? 'Shared' : 'Copied'}</span>
        </>
      ) : status === 'failed' ? (
        <>
          <Link2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Copy failed</span>
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  );
}
