'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-4 sm:px-6">
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        The converter hit an unexpected error. Your saved currencies and cities are kept.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex h-10 w-fit items-center rounded-md bg-foreground px-4 text-[15px] font-medium text-background transition-opacity hover:opacity-80"
      >
        Try again
      </button>
    </main>
  );
}
