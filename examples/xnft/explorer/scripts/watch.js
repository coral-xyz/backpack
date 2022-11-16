const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const fs = require("fs");
const express = require("express");
const app = express(); // create express app
const path = require("path");
const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");

let js;
let port = 9933;

require("esbuild")
  .build({
    entryPoints: ["./src/index.tsx"],
    outfile: "dist/index.js",
    bundle: true,
    target: "es2022",
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
    watch: {
      onRebuild(error, result) {
        console.log("build changed");
        if (error) console.error("build error", JSON.stringify(err));
        js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
      },
    },
  })
  .then((result) => {
    console.log("watching...");
    js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
  });

rendererScript = `<script src="https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@latest/dist/index.js"></script>`;

app.get("/", (req, res) => {
  res.send(`
	<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <title>simulator</title>
          <body>
            <div id="container"></div>
            <script>${js}</script>
            ${rendererScript}
          </body>
        </html>
  `);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
