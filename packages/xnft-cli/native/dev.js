const fs = require("fs");
const express = require("express");
const esconfig = require("./esbuild.config.web");
const getHtmlWrapper = require("./getHtmlWrapper");
module.exports = (program) => {
  program.command("dev").action(() => {
    const app = express(); // create express app

    let js;
    let port = 9933;

    require("esbuild")
      .build({
        ...esconfig,
        watch: {
          onRebuild(error, result) {
            if (error) console.error("build error", JSON.stringify(err));
            js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
          },
        },
      })
      .then((result) => {
        console.log("watching...");
        js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
      });

    app.get("/", (req, res) => {
      res.send(getHtmlWrapper(js));
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
};
