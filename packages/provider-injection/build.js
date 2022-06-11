const esbuild = require("esbuild");
const { nodeBuiltIns } = require("esbuild-node-builtins");

const { DEFAULT_SOLANA_CONNECTION_URL, NODE_DEBUG, NODE_ENV } = process.env;

esbuild.build({
  bundle: true,
  define: {
    global: "globalThis",
    "process.env": JSON.stringify({
      DEFAULT_SOLANA_CONNECTION_URL,
      NODE_DEBUG,
      NODE_ENV,
    }),
  },
  entryPoints: ["./src/index.ts"],
  minify: false,
  outdir: "./dist/browser",
  plugins: [nodeBuiltIns()],
  target: ["chrome98"],
  sourcemap: "inline",
  treeShaking: true,
});
