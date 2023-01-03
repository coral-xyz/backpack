const { promises, statSync } = require("fs");
const path = require("path");
const glob = require("fast-glob");
const { NOTFOUND } = require("dns");
const { readFile, writeFile, mkdir } = promises;

module.exports = async (xnftPath) => {
  const xnftBuffer = await readFile(xnftPath);
  const xnft = JSON.parse(await xnftBuffer.toString());

  const include = [path.basename(xnftPath), xnft.icon, ...xnft.screenshots];

  Object.values(xnft.entrypoints).forEach((entrypoint) => {
    Object.values(entrypoint).forEach((filePath) => {
      const stats = statSync(filePath);
      if (stats.isDirectory()) {
        include.push(path.join(filePath, "/**/*"));
      } else {
        const dir = path.dirname(filePath);
        include.push(path.join(dir, "/**/*"));
      }
    });
  });

  console.log(include);

  return {
    ...xnft,
    globs: include,
  };
};
