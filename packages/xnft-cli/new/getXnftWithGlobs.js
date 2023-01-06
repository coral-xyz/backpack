const { promises, statSync } = require("fs");
const path = require("path");
const glob = require("fast-glob");
const { NOTFOUND } = require("dns");
const { object, string, array, record, any, union, literal } = require("zod");
const { readFile, writeFile, mkdir } = promises;

const xnftJson = object({
  name: string(),
  description: string(),
  icon: record(
    string().refine((key) => ["sm", "md", "lg"].includes(key), {
      message: "Available sizes: sm, md, lg",
    }),
    string()
  ),
  screenshots: array(string()),
  entrypoints: record(
    record(
      string().refine((key) => ["web", "android", "ios"].includes(key), {
        message: "Available platforms: web, android, ios",
      }),
      string()
    )
  ).refine((entrypoints) => !!entrypoints.default, {
    message: "Must provide a 'default' entrypoint.",
  }),
  props: any(),
});

module.exports = async (xnftPath) => {
  const xnftBuffer = await readFile(xnftPath);
  const xnft = await xnftJson.parse(JSON.parse(await xnftBuffer.toString()));

  const include = [
    path.basename(xnftPath),
    ...Object.values(xnft.icon),
    ...xnft.screenshots,
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
