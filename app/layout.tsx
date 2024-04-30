import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Currency',
  description: 'Currency PWA application',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <body className={inter.className}>{children}</body>
      </ThemeProvider>
    </html>
  );
}
