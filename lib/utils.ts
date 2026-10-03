import type { FocusEvent, MouseEvent } from 'react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Selects the whole value when an input gains focus, so typing replaces it.
// The mouseup that ends a click-to-focus would collapse the selection, so it
// is cancelled once.
export const selectAllOnFocus = {
  onMouseDown: (event: MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== event.currentTarget) {
      event.currentTarget.dataset.keepSelection = 'true';
    }
  },
  onFocus: (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  },
  onMouseUp: (event: MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.dataset.keepSelection) {
      event.preventDefault();
      delete event.currentTarget.dataset.keepSelection;
    }
  },
};
