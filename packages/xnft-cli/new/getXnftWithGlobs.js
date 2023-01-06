const { promises, statSync } = require("fs");
const path = require("path");
const glob = require("fast-glob");
const { NOTFOUND } = require("dns");
const { object, string, array, record, any, union, literal } = require("zod");
const { readFile, writeFile, mkdir } = promises;

const platforms = ["web", "android", "ios"];
const sizes = ["sm", "md", "lg"];

const xnftJson = object({
  name: string(),
  description: string(),
  icon: record(
    string().refine((key) => sizes.includes(key), {
      message: "Available sizes: " + sizes.join(", "),
    }),
    string()
  ).optional(),
  screenshots: array(string()).optional(),
  splash: array(string()).optional(),
  entrypoints: record(
    record(
      string().refine((key) => platforms.includes(key), {
        message: "Available platforms: " + platforms.join(", "),
      }),
      string()
    ).refine((entrypoint) => Object.keys(entrypoint).length > 0, {
      message:
        "Must provide at least one platform (" +
        platforms.join(", ") +
        ") per entrypoint.",
    })
  ).refine((entrypoints) => !!entrypoints.default, {
    message: "Must provide a 'default' entrypoint.",
  }),
  props: any().optional(),
});

module.exports = async (xnftPath) => {
  const xnftBuffer = await readFile(xnftPath);
  const xnft = await xnftJson.parse(JSON.parse(await xnftBuffer.toString()));

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
