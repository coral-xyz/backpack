const fs = require("fs");
const express = require("express");
const getHtmlWrapper = require("./getHtmlWrapper");
module.exports = (program) => {
  program.command("start").action(() => {
    const app = express(); // create express app

    const js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
    let port = 9933;

    app.get("/", (req, res) => {
      res.send(getHtmlWrapper(js));
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
};
