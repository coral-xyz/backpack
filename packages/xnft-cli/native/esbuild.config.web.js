const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");
const resolve = require("esbuild-plugin-resolve");
const getHtmlWrapper = require("./getHtmlWrapper");
module.exports = {
  entryPoints: ["./src/index.tsx"],
  outfile: "dist/index.html",
  mainFields: ["browser", "module", "main"],
  bundle: true,
  target: "es2022",
  define: {
    global: "window",
  },
  banner: { js: getHtmlWrapper.banner },
  footer: { js: getHtmlWrapper.footer },
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
