import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import type { Viewport } from 'next';

import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Currency',
  description: 'Quick converter for checking money amounts and time differences in one simple screen.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['nextjs', 'pwa', 'next-pwa', 'currency', 'currencies'],
  authors: [{ name: 'earlwlkr' }],
  icons: [
    { rel: 'icon', url: '/icons/icon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111113' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
