const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");

const rl = readline.createInterface({ input, output });

rl.question(
  "Did you save your .env files (backpack-api, etc)? (y/n)",
  (answer) => {
    if (answer === "y") {
      console.log("Running build:fresh");
      rl.close();
    } else {
      console.log("Exiting. Good save.");
      process.exit(1);
    }
  }
);
