const esbuild = require("esbuild");
const fs = require("fs");
const { polyfillNode } = require("esbuild-plugin-polyfill-node");
const { htmlPlugin } = require("@craftamap/esbuild-plugin-html");
const path = require("path");

esbuild
  .context({
    entryPoints: ["src/browser.ts"],
    bundle: true,
    // outfile: "dist/bundle.js",
    metafile: true,
    outdir: "../app-mobile/assets/",
    minify: true, // TODO: process.env.NODE_ENV === "production"
    sourcemap: false, // TODO: external for extension, false for mobile
    legalComments: "none", // TODO: inline for extension, external for mobile
    treeShaking: true,
    plugins: [
      {
        name: "buildStatus",
        setup(build) {
          let count = 0;
          build.onEnd((result) => {
            console.log(
              `${
                count++ > 0 ? "re" : ""
              }built packages/app-mobile/assets/hiddenwebview.html, with ${
                result.errors.length
              } errors`
            );
            // TODO: don't export the bundled browser.js file
            try {
              fs.rm("../app-mobile/assets/browser.js", () => {});
            } catch (err) {}
          });
        },
      },
      polyfillNode({
        polyfills: {
          crypto: true,
        },
      }),
      htmlPlugin({
        files: [
          {
            inline: true,
            entryPoints: ["src/browser.ts"],
            filename: "hiddenwebview.html",
            htmlTemplate: `<!DOCTYPE html><html lang="en"><head><script>globalThis.isHiddenWebView = true;</script></head><body><ul id="messages"></ul></body></html>`,
            scriptLoading: "module",
          },
        ],
      }),

      {
        // This is used for analyzing the bundle size, it can be
        // uploaded to https://esbuild.github.io/analyze/
        name: "metafileWriter",
        setup(build) {
          build.onEnd((result) => {
            const filePath = "./dist/metafile.json";
            if (
              process.env.METAFILE &&
              result.metafile &&
              result.errors.length === 0
            ) {
              fs.writeFile(
                path.join(__dirname, filePath),
                JSON.stringify(result.metafile),
                (err) => {
                  if (err) {
                    console.error("error writing metafile", err);
                  } else {
                    console.log(`metafile written to ${filePath}`);
                  }
                }
              );
            } else {
              fs.rm(path.join(__dirname, filePath), () => {});
            }
          });
        },
      },
    ],
  })
  .then((ctx) => {
    ctx.watch().then(() => {
      process.argv.includes("--watch")
        ? console.log("watching...")
        : ctx.dispose();
    });
  });
