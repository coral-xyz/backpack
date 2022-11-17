const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const fs = require("fs");
const express = require("express");
const app = express(); // create express app

let js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
let port = 9933;

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
