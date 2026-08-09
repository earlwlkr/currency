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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md border-y border-border py-10 text-center">
        <p className="section-index">Current / Error</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A runtime error occurred. You can retry without reloading the whole app.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
