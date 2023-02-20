const fs = require("fs");
const express = require("express");
const esconfig = require("./esbuild.config.web");
const simulatorPort = require("../simulatorPort");
module.exports = (program) => {
  program.command("dev").action(() => {
    const app = express(); // create express app

    let html;
    let port = simulatorPort;

    require("esbuild")
      .build({
        ...esconfig,
        watch: {
          onRebuild(error, result) {
            console.log("build changed");
            if (error) console.error("build error", JSON.stringify(err));
            html = fs.readFileSync("dist/index.html", { encoding: "utf-8" });
          },
        },
      })
      .then((result) => {
        console.log("watching...");
        html = fs.readFileSync("dist/index.html", { encoding: "utf-8" });
      });

    app.get("/", (req, res) => {
      res.send(html);
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
};
