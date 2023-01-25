const { BuildJsonManifestSchema } = require("@coral-xyz/xnft");
const { promises, statSync } = require("fs");
const path = require("path");
const { readFile } = promises;

module.exports = async (xnftPath) => {
  const xnftBuffer = await readFile(xnftPath);
  const xnft = BuildJsonManifestSchema.parse(JSON.parse(xnftBuffer.toString()));

  const include = [
    path.basename(xnftPath),
    ...Object.values(xnft.icon ?? {}),
    ...Object.values(xnft.splash ?? {}),
    ...(xnft.screenshots ?? []),
  ];

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

  const unique = [...new Set(include)];

  console.log(unique);

  return {
    ...xnft,
    globs: unique,
  };
};
