const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const fs = require("fs");
const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");

require("esbuild").build({
  entryPoints: ["./src/index.tsx"],
  outfile: "dist/index.js",
  bundle: true,
  target: "es2022",
  minify: true,
  define: {
    global: "window",
  },
  // inject: ["./scripts/polyfills.js"],
  plugins: [
    GlobalsPolyfills.default({
      process: true,
      buffer: true,
    }),
    plugin(stdLibBrowser),
  ],
});
