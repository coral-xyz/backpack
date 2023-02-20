const fs = require("fs");
const express = require("express");
const getHtmlWrapper = require("./getHtmlWrapper");
const simulatorPort = require("../simulatorPort");
module.exports = (program) => {
  program.command("start").action(() => {
    const app = express(); // create express app

    const html = fs.readFileSync("dist/index.html", { encoding: "utf-8" });
    let port = simulatorPort;

    app.get("/", (req, res) => {
      res.send(html);
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
};
