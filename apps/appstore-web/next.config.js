const { withPlausibleProxy } = require("next-plausible");

/** @type {import('next').NextConfig} */
const moduleExports = withPlausibleProxy()({
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
  },
});

module.exports = moduleExports;
