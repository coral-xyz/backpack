#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo
const build = require("./build");
const start = require("./start");
const dev = require("./dev");

module.exports = (program) => {
  build(program);
  start(program);
  dev(program);

  program
    .command("init")
    .argument("<name>", "name of the xnft")
    .action(async (name) => {
      const download = require("download-git-repo");

      await download(
        "coral-xyz/xnft-quickstart",
        `${name}/`,
        function (err) {}
      );

      console.debug(`${name} initalized`);
      console.debug(``);
      console.debug(`run these commands:`);
      console.debug(`cd ${name}`);
      console.debug(`yarn && yarn dev`);
    });
};
