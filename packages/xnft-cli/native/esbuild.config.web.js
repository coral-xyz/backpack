const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");

module.exports = {
  entryPoints: ["./src/index.tsx"],
  outfile: "dist/index.js",
  tsconfig: __dirname + "/tsconfig.native.web.json",
  mainFields: ["browser", "module", "main"],
  bundle: true,
  target: "es2022",
  define: {
    global: "window",
  },
  plugins: [
    GlobalsPolyfills.default({
      process: true,
      buffer: true,
    }),
    plugin(stdLibBrowser),
  ],
};
