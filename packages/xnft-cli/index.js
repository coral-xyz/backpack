#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo
const { program } = require("commander");
const fs = require("fs");
const bundle = require("./new");

const pkg = JSON.parse(fs.readFileSync(__dirname + "/package.json").toString());
program.version(pkg.version);
bundle(program);
program.parse();
