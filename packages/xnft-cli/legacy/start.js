const fs = require("fs");
const express = require("express");
const simulatorPort = require("../simulatorPort");

module.exports = (program) => {
  program.command("start").action(async () => {
    const app = express();
    const port = simulatorPort;
    const html = fs.readFileSync("dist/index.html", { encoding: "utf-8" });

    app.get("/", (req, res) => {
      res.send(html);
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
};
