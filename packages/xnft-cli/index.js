#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo
const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill");
const { Parcel } = require("@parcel/core");
const { program } = require("commander");
const { join, resolve } = require("path");
const native = require("./native");
const fs = require("fs");

const { SIMULATOR_PORT } = { SIMULATOR_PORT: 9933 }; // TODO: replace with import.

const pkg = JSON.parse(fs.readFileSync(__dirname + "/package.json").toString());
program.version(pkg.version);

native(program.command("native"));

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
  additionalReporters: [
    {
      packageName: "@parcel/reporter-cli",
      resolveFrom: __filename,
    },
  ],
};

const esBuildOptions = {
  entryPoints: ["./src/index.tsx"],
  outfile: "dist/index.js",
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
  ],
};

program
  .command("build")
  .option(
    "-e, --esbuild <boolean>",
    "Use esbuild to compile your project, useful when you want to polyfill constructs like process"
  )
  .action(async ({ esbuild }) => {
    if (esbuild) {
      const startTime = new Date();
      require("esbuild")
        .build({
          ...esBuildOptions,
        })
        .then((result) => {
          console.debug(`✨ esbuild built in ${new Date() - startTime}ms!`);
        });
    } else {
      // https://parceljs.org/features/parcel-api/#building
      const bundler = new Parcel({
        ...options,
        mode: "production",
        sourceMap: false,
        optimize: true,
      });
      try {
        const { buildTime } = await bundler.run();
        console.debug(`✨ parcel built in ${buildTime}ms!`);
      } catch (err) {
        console.error(err.diagnostics);
      }
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

program
  .command("dev")
  .option(
    "-i, --iframe <string>",
    "a URL to load inside an iframe xNFT in the simulator",
    (url) => new URL(url)?.href
  )
  .option(
    "-e, --esbuild <boolean>",
    "Use esbuild to compile your project, useful when you want to polyfill constructs like process"
  )
  .action(async ({ iframe, esbuild }) => {
    console.debug(`👀 watching ${resolve()}`);

    const express = require("express");
    const fs = require("fs");
    const app = express();

    const port = SIMULATOR_PORT;

    let js;
    let rendererScript;

    try {
      const rendererFileContent = fs.readFileSync(
        join(__dirname, "renderer.js"),
        {
          encoding: "utf-8",
        }
      );
      rendererScript = `<script>${rendererFileContent}</script>`;
    } catch (e) {
      console.log("falling back to latest renderer");
      // fallback to latest version of renderer
      rendererScript = `<script src="https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@latest/dist/index.js"></script>`;
    }
    if (iframe) {
      // If an iframe URL has been provided then serve the iframe xNFT example,
      // but replace the source URL with the provided one
      js = fs
        .readFileSync(join(__dirname, "iframe.js"), {
          encoding: "utf-8",
        })
        .replace(
          "https://coral-xyz.github.io/backpack/iframe-example.html",
          iframe
        );
    } else {
      if (!esbuild) {
        const bundler = new Parcel({
          ...options,
          mode: "development",
          sourceMap: true,
          optimize: false,
        });

        if (!fs.existsSync("dist/index.js")) {
          if (!fs.existsSync("dist")) {
            fs.mkdirSync("dist");
          }
          fs.writeFileSync("dist/index.js", "");
        }

        js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
        await bundler.watch((err, buildEvent) => {
          console.log("build changed");
          if (err) {
            console.error("build error", JSON.stringify(err));
          }
          if (buildEvent.type === "buildFailure") {
            console.error("build error", JSON.stringify(buildEvent));
          }
          js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
        });
      } else {
        // https://parceljs.org/features/parcel-api/#watching
        require("esbuild")
          .build({
            ...esBuildOptions,
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
      }
    }

    app.get("/", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              html, body {
                position:relative;
                margin: 0;
                padding: 0;
                height:100%;
                display:flex;
                flex-direction: column;
              }
              #native-container {
                display:none;
                flex-direction: column;
                flex: 1 0 100%;
              }
            </style>
          </head>
          <title>simulator</title>
          <body>
            <div id="native-container"></div>
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
  });

program
  .command("init")
  .argument("<name>", "name of the xnft")
  .action(async (name) => {
    const download = require("download-git-repo");

    await download("coral-xyz/xnft-quickstart", `${name}/`, function (err) {});

    console.debug(`${name} initalized`);
    console.debug(``);
    console.debug(`run these commands:`);
    console.debug(`cd ${name}`);
    console.debug(`yarn && yarn dev`);
  });

program.parse();
