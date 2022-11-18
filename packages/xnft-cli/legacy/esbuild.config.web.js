const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");
const fs = require("fs");
const getHtmlWrapper = require("./getHtmlWrapper");

const rendererFileContent = fs.readFileSync(`${__dirname}/../renderer.js`, {
  encoding: "utf-8",
});

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
  footer: { js: getHtmlWrapper.footer(rendererFileContent) },
  plugins: [
    GlobalsPolyfills.default({
      process: true,
      buffer: true,
    }),
    plugin(stdLibBrowser),
  ],
};
