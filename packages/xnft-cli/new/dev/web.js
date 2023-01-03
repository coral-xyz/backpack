const getXnftWithGlobs = require("../getXnftWithGlobs");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const express = require("express");
const simulatorPort = require("../../simulatorPort");

const tempDir = ".xnft-bundle";

module.exports = (program) => {
  program
    .command("web")
    .argument("[entrypoint]", "entrypoint name", "default")
    .option("-x, --xnft <string>", "Path to xnft.json file")
    .action(async (entrypoint, { xnft: xnftPath = "./xnft.json" }) => {
      console.debug(`👀 watching`);
      xnftPath = path.resolve(xnftPath);
      const basePath = path.dirname(xnftPath);
      const xnft = await getXnftWithGlobs(xnftPath);

      const findTarget = (from) => {
        const relativeFrom = path.relative(basePath, from);
        return path.join(basePath, tempDir, relativeFrom);
      };

      const copy = (from) => {
        const to = findTarget(from);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        const stats = fs.statSync(from);
        if (stats.isDirectory()) {
          return;
        }
        fs.writeFileSync(to, fs.readFileSync(from));
        // console.log('[COPY]', from, 'to', to);
      };

      const remove = (from) => {
        const to = findTarget(from);
        fs.unlinkSync(to);
        // console.log('[DELETE]', to);
      };

      const rimraf = (dir) => {
        if (fs.existsSync(dir)) {
          fs.readdirSync(dir).forEach((entry) => {
            const entryPath = path.join(dir, entry);
            if (fs.lstatSync(entryPath).isDirectory()) {
              rimraf(entryPath);
            } else {
              fs.unlinkSync(entryPath);
            }
          });
          fs.rmdirSync(dir);
        }
      };

      rimraf(path.join(basePath, tempDir));

      console.log("[ROOT]", basePath);

      chokidar
        .watch(xnft.globs, {
          ignoreInitial: false,
          ignored: xnft.exclude,
          cwd: basePath,
        })
        .on("ready", () => xnft.globs.forEach((s) => console.log("[WATCH]", s)))
        .on("add", copy)
        .on("addDir", copy)
        .on("change", copy)
        .on("unlink", remove)
        .on("unlinkDir", remove)
        .on("error", (e) => console.log("[ERROR]", e));

      const app = express();
      const port = simulatorPort;

      const entry = xnft.entrypoints[entrypoint].web;

      app.use(express.static(basePath));

      app.use("/", express.static(path.join(basePath, entry)));

      app.listen(port, () => {
        console.log(`listening on port ${port}`);
      });
    });
};
