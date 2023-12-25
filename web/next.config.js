const { withPlausibleProxy } = require('next-plausible');

/** @type {import('next').NextConfig} */
const moduleExports = withPlausibleProxy()({
  swcMinify: true,
  reactStrictMode: true,
  // experimental: {
  //   newNextLinkBehavior: true,
  //   scrollRestoration: true,
  //   legacyBrowsers: false,
  //   runtime: 'nodejs'
  // },
  images: {
    domains: [
      'xnfts-dev.s3.us-west-2.amazonaws.com',
      'xnfts.s3.us-west-2.amazonaws.com',
      'content.fortune.com',
      'techcrunch.com',
      'coindesk.com',
      'www.coindesk.com',
      'www.tbstat.com',
      'blockworks.co',
      'nftnow.com',
      'img.decrypt.co'
    ],
    formats: ['image/avif', 'image/webp']
  },
  typescript: {
    ignoreBuildErrors: true
  },
  redirects() {
    return [
      {
        source: '/download',
        destination:
          'https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof',
        permanent: true
      },
      {
        source: '/ref/:username',
        destination: 'https://backpack-api.xnfts.dev/referrals/:username',
        permanent: true
      },
      {
        // Required for Google to validate Android deeplinks
        source: '/ul',
        destination: '/',
        permanent: true
      }
    ];
  }
});

module.exports = moduleExports;
