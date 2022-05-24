#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build.js";

program.description("The xNFT CLI").name("xnft");

program
  .command("bundle")
  .requiredOption("-i, --input <string>", "input file")
  .requiredOption("-o, --output <string>", "output file")
  .description("create a javascript bundle")
  .action(build);

program.parse();
