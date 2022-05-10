const { withPlausibleProxy } = require("next-plausible");

/** @type {import('next').NextConfig} */
const moduleExports = withPlausibleProxy()({
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    runtime: "nodejs",
    esmExternals: "loose",
  },
});

module.exports = moduleExports;
