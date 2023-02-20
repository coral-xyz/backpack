const { promises } = require("fs");
const path = require("path");
const glob = require("fast-glob");
const JSZip = require("jszip");
const getXnftWithGlobs = require("./getXnftWithGlobs");

const { readFile, writeFile, mkdir } = promises;

module.exports = (program) => {
  program
    .command("bundle")
    .option("-x, --xnft <string>", "Path to xnft.json file")
    .option("-d, --dest <string>", "Destination path")
    .action(async function ({
      xnft: xnftPath = "./xnft.json",
      dest = "xnft-bundle.zip",
    }) {
      xnftPath = path.resolve(xnftPath);
      const basePath = path.dirname(xnftPath);
      const manifestFilename = path.basename(xnftPath);
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

      const zip = new JSZip();

      await Promise.all(
        filePaths.map(async (file) => {
          const dest =
            file !== xnftPath
              ? file
              : file.replace(manifestFilename, "xnft.json");
          zip.file(path.relative(basePath, dest), await readFile(file));
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
