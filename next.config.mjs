import NextPWA from 'next-pwa';

const withPWA = NextPWA({
  dest: 'public',
  // disable: process.env.NODE_ENV === 'development',
  // register: true,
  skipWaiting: true,
  buildExcludes: ['app-build-manifest.json'],
  // fallbacks: {
  //   document: '/',
  // },
});

const generateAppDirEntry = (entry) => {
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

const isDev = process.env.NODE_ENV !== 'production';
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack(config) {
    if (!isDev) {
      const entry = generateAppDirEntry(config.entry);

      config.entry = () => entry;
    }

    return config;
  },

  // output: 'export',
};

export default withPWA(nextConfig);
