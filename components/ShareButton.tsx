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

  const isDone = status === 'copied' || status === 'shared';
  const label =
    status === 'shared'
      ? 'Shared'
      : status === 'copied'
        ? 'Link copied'
        : status === 'failed'
          ? 'Couldn’t copy link'
          : 'Share';

  return (
    <button
      type="button"
      onClick={handleShare}
      className="-mr-2 flex h-10 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title="Share a link to this setup"
    >
      {isDone ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only sm:not-sr-only" aria-live="polite">
        {label}
      </span>
    </button>
  );
}
