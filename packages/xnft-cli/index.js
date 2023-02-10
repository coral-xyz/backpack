#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo
const { program } = require("commander");
const native = require("./native");
const fs = require("fs");
const legacy = require("./legacy");
const bundle = require("./new");

const pkg = JSON.parse(fs.readFileSync(__dirname + "/package.json").toString());
program.version(pkg.version);

native(program.command("native"));

legacy(program.command("legacy"));

bundle(program);

program.parse();
