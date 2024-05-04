import path from 'path';
import NextPWA from 'next-pwa';
import { createRequire } from 'node:module';

const isDev = process.env.NODE_ENV === 'development';

const withPWA = NextPWA({
  dest: 'public',
  disable: isDev,
  // register: true,
  skipWaiting: true,
});

const generateAppDirEntry = (entry) => {
  const require = createRequire(import.meta.url);
  const packagePath = require.resolve('next-pwa');
  const packageDirectory = path.dirname(packagePath);
  const registerJs = path.join(packageDirectory, 'register.js');

  return entry().then((entries) => {
    // Register SW on App directory, solution: https://github.com/shadowwalker/next-pwa/pull/427
    if (entries['main-app'] && !entries['main-app'].includes(registerJs)) {
      if (Array.isArray(entries['main-app'])) {
        entries['main-app'].unshift(registerJs);
      } else if (typeof entries['main-app'] === 'string') {
        entries['main-app'] = [registerJs, entries['main-app']];
      }
    }

    return entries;
  });
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',

  webpack(config) {
    if (!isDev) {
      const entry = generateAppDirEntry(config.entry);
      config.entry = () => entry;
    }

    return config;
  },
};

export default withPWA(nextConfig);
