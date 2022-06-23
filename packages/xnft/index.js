#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo

const { Parcel } = require("@parcel/core");
const { program } = require("commander");

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

program.command("watch").action(async ({ port }) => {
  console.debug(`👀 watching on http://localhost:${port}`);
  // https://parceljs.org/features/parcel-api/#watching
  const bundler = new Parcel({
    ...options,
    mode: "development",
    sourceMap: true,
    optimize: false,
  });
  await bundler.watch();
});

program.parse();
