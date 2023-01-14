const express = require("express");
const fs = require("fs");
const simulatorPort = require("../../simulatorPort");

const web = require("./web");

module.exports = (program) => {
  program.description("CLI for xnfts");

  web(program);

  // If an iframe URL has been provided then serve the iframe xNFT example,
  // but replace the source URL with the provided one
  program
    .option(
      "-i, --iframe <string>",
      "a URL to load inside an iframe xNFT in the simulator",
      (url) => new URL(url)?.href
    )
    .action(async ({ iframe }) => {
      console.debug(`👀 watching`);

      const app = express();
      const port = simulatorPort;

      app.get("/", (req, res) => {
        res.redirect(301, iframe);
      });

      app.listen(port, () => {
        console.log(`listening on port ${port}`);
      });
    });
};
