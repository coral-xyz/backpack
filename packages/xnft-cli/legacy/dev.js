const esconfig = require("./esbuild.config.web");
const express = require("express");
const fs = require("fs");
const simulatorPort = require("../simulatorPort");

module.exports = (program) => {
  program
    .command("dev")
    .option(
      "-i, --iframe <string>",
      "a URL to load inside an iframe xNFT in the simulator",
      (url) => new URL(url)?.href
    )
    .action(async ({ iframe, esbuild }) => {
      console.debug(`👀 watching`);

      const app = express();
      const port = simulatorPort;

      if (iframe) {
        // If an iframe URL has been provided then serve the iframe xNFT example,
        // but replace the source URL with the provided one
        html = fs
          .readFileSync(`${__dirname}/../iframe.html`, {
            encoding: "utf-8",
          })
          .replace(
            "https://coral-xyz.github.io/backpack/iframe-example.html",
            iframe
          );
      } else {
        require("esbuild")
          .build({
            ...esconfig,
            watch: {
              onRebuild(error, result) {
                console.log("build changed");
                if (error) console.error("build error", JSON.stringify(err));
                html = fs.readFileSync("dist/index.html", {
                  encoding: "utf-8",
                });
              },
            },
          })
          .then((result) => {
            console.log("watching...");
            html = fs.readFileSync("dist/index.html", { encoding: "utf-8" });
          });
      }

      app.get("/", (req, res) => {
        res.send(html);
      });

      app.listen(port, () => {
        console.log(`listening on port ${port}`);
      });
    });
};
