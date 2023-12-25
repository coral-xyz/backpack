const esbuild = require("esbuild");
const { nodeBuiltIns } = require("esbuild-node-builtins");
// const { polyfillNode } = require("esbuild-plugin-polyfill-node");

const fs = require("fs");
const path = require("path");

const { DEFAULT_SOLANA_CONNECTION_URL, NODE_DEBUG, NODE_ENV } = process.env;

esbuild
  .context({
    bundle: true,
    metafile: true,
    define: {
      global: "globalThis",
      "process.env": JSON.stringify({
        DEFAULT_SOLANA_CONNECTION_URL,
        NODE_DEBUG,
        NODE_ENV,
      }),
    },
    plugins: [
      nodeBuiltIns(),
      // polyfillNode({
      //   polyfills: {
      //     crypto: true,
      //   },
      // }),
      {
        name: "buildStatus",
        setup(build) {
          let count = 0;
          build.onEnd((result) => {
            console.log(
              `${count++ > 0 ? "re" : ""}built provider-injection, with ${
                result.errors.length
              } errors`
            );
            fs.cp(
              "./dist/browser/index.js",
              "../app-mobile/assets/provider.html",
              () => {}
            );
          });
        },
      },
      {
        // This is used for analyzing the bundle size, it can be
        // uploaded to https://esbuild.github.io/analyze/
        name: "metafileWriter",
        setup(build) {
          build.onEnd((result) => {
            const filePath = "./dist/browser/metafile.json";
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
    entryPoints: ["./src/index.ts"],
    outfile: "./dist/browser/index.js",
    target: ["chrome114"],
    minify: true, // TODO: process.env.NODE_ENV === "production"
    sourcemap: false, // TODO: external for extension, false for mobile
    legalComments: "none", // TODO: inline for extension, external for mobile
    treeShaking: true,
  })
  .then((ctx) => {
    ctx.watch().then(() => {
      process.argv.includes("--watch")
        ? console.log("watching...")
        : ctx.dispose();
    });
  });
