import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import type { Viewport } from 'next';

import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Currency & Time Converter',
  description: 'Quick converter for checking money amounts and time differences in one simple screen.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['nextjs', 'pwa', 'next-pwa', 'currency', 'currencies'],
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#fff' }],
  authors: [{ name: 'earlwlkr' }],
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/icon-192x192.png' },
    { rel: 'icon', url: 'icons/icon-192x192.png' },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
