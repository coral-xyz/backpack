#!/usr/bin/env node

const { writeFileSync } = require("fs");

const esbuild = require("esbuild");
const { nodeBuiltIns } = require("esbuild-node-builtins");

const [inputFile] = process.argv.slice(2);

if (!inputFile) {
  console.error("file param missing, usage:\ndeptool [inputfile.ts]");
  process.exit(1);
}

const go = async () => {
  const result = await esbuild.build({
    bundle: true,
    define: {
      global: "globalThis",
      "process.env.DEFAULT_SOLANA_CONNECTION_URL": undefined,
      "process.env.NODE_DEBUG": false,
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
    },
    entryPoints: [inputFile],
    incremental: true,
    legalComments: "none",
    loader: {
      ".woff2": "file",
      ".woff": "file",
    },
    metafile: true,
    minify: false,
    outfile: "/tmp/out.js",
    plugins: [nodeBuiltIns()],
    sourcemap: false,
    target: "es2021",
    target: ["chrome100"],
    treeShaking: true,
    write: false,
  });

  const output = Object.keys(result.metafile.inputs)
    .reverse()
    .filter((i) => !i.includes("node_modules"))
    .reduce((acc, curr) => {
      acc[curr] = result.metafile.inputs[curr];
      return acc;
    }, {});

  const lines = [
    "<style>a:visited { color: #CCC; } body { padding-bottom: 100vh; }</style><ul>",
  ];

  const { inputs } = Object.values(result.metafile.outputs)[0];

  Object.keys(output)
    .filter((k) => inputs[k])
    .forEach((key) => {
      lines.push(`<li id="${id(key)}"><a href="#${id(key)}">${key}</a>`);
      lines.push("<ul>");
      output[key].imports.forEach((i) => {
        if (!i.path.includes("node_modules") && inputs[i.path]) {
          lines.push(`<li><a href="#${id(i.path)}">${i.path}</a></li>`);
        }
      });
      lines.push("</ul></li>");
    });

  lines.push("</ul>");

  // writeFileSync("meta.json", JSON.stringify(output, null, 2));
  writeFileSync("deptool-report.html", lines.join("\n"));
};

const rand = Date.now();
const id = (input) => `${input}?${rand}`;

go();
