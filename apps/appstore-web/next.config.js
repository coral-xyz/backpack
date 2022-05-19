const { withPlausibleProxy } = require('next-plausible');

/** @type {import('next').NextConfig} */
const moduleExports = withPlausibleProxy()({
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose',
    newNextLinkBehavior: true
  },
  images: {
    domains: ['xnfts-dev.s3.us-west-2.amazonaws.com', 'xnfts.s3.us-west-2.amazonaws.com']
  }
});

module.exports = moduleExports;
