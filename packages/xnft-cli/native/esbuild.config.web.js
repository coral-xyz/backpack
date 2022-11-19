const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");
const resolve = require("esbuild-plugin-resolve");

module.exports = {
  entryPoints: ["./src/index.tsx"],
  outfile: "dist/index.js",
  // tsconfig: __dirname + "/tsconfig.native.web.js",
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
    resolve({
      "react-native": "react-native-web/dist/cjs",
    }),
  ],
};
