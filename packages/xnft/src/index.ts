#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build.js";

program.description("The xNFT CLI").name("xnft");

program
  .command("build")
  // .arguments("[input-file]")
  // .option("-o, --output <string>", "output file")
  .description("create a javascript bundle")
  .action(() => build(false));

program.command("watch").action(() => build(true));

program.parse();
