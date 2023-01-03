const { promises } = require("fs");
const path = require("path");
const glob = require("fast-glob");
const JSZip = require("jszip");
const getXnftWithGlobs = require("./getXnftWithGlobs");

const { readFile, writeFile, mkdir } = promises;

module.exports = (program) => {
  program
    .command("bundle")
    .argument("[xnftPath]", "xnft.json file")
    .option("-d, --dest <string>", "Destination path")
    .action(async function (xnftPath) {
      xnftPath = path.resolve(xnftPath ?? "./xnft.json");
      const options = this.opts();
      const dest = options.dest ?? "xnft-bundle.zip";
      const basePath = path.dirname(xnftPath);
      const destPath = path.join(
        process.cwd(),
        dest.replace(/\.zip$/, "") + ".zip"
      );

      const xnft = await getXnftWithGlobs(xnftPath);
      const filePaths = await glob(xnft.globs, {
        ignore: xnft.exclude,
        cwd: basePath,
        absolute: true,
      });
      console.log(xnft.globs);
      const zip = new JSZip();

      await Promise.all(
        filePaths.map(async (file) => {
          zip.file(path.relative(basePath, file), await readFile(file));
        })
      );

      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      });

      await mkdir(path.dirname(destPath), { recursive: true });
      await writeFile(destPath, zipBuffer);
    });
};
