#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build.js";

program.description("The xNFT CLI").name("xnft");

program
  .command("build")
  .argument("<input-file>")
  .option("-o, --output <string>", "output file")
  .description("create a javascript bundle")
  .action(build);

program.parse();
