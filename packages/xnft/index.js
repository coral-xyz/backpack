#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo

const { Parcel } = require("@parcel/core");
const { program } = require("commander");
const { resolve } = require("path");

const options = {
  entries: "./src/index.tsx",
  defaultConfig: "@parcel/config-default",
  defaultTargetOptions: {
    engines: {
      browsers: ["last 1 Chrome version"],
    },
  },
  targets: {
    modern: {
      distDir: "dist",
    },
  },
};

program.command("build").action(async () => {
  // https://parceljs.org/features/parcel-api/#building
  const bundler = new Parcel({
    ...options,
    mode: "production",
    sourceMap: false,
    optimize: true,
  });

  try {
    const { buildTime } = await bundler.run();
    console.debug(`✨ built in ${buildTime}ms!`);
  } catch (err) {
    console.error(err.diagnostics);
  }
});

program.command("watch").action(async () => {
  console.debug(`👀 watching ${resolve()}`);
  // https://parceljs.org/features/parcel-api/#watching
  const bundler = new Parcel({
    ...options,
    mode: "development",
    sourceMap: true,
    optimize: false,
  });
  await bundler.watch();
});

program.command("dev").action(async () => {
  console.debug(`👀 watching ${resolve()}`);

  const express = require("express");
  const fs = require("fs");
  const app = express();
  const port = 9990;

  // https://parceljs.org/features/parcel-api/#watching
  const bundler = new Parcel({
    ...options,
    mode: "development",
    sourceMap: true,
    optimize: false,
  });
  let js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
  await bundler.watch(() => {
    console.log("build changed");
    js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
  });

  app.get("/", (req, res) => {
    const innerHTML = `
        <script type="module">${js}</script>`;
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
          </head>
          <body>${innerHTML}</body>
        </html>
        `);
  });
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
});

program.parse();
