const { withPlausibleProxy } = require("next-plausible");

/** @type {import('next').NextConfig} */
const moduleExports = withPlausibleProxy()({
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    runtime: "nodejs",
  },
});

module.exports = moduleExports;
