import esbuild from "esbuild";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import path from "path";

const dirName = path.resolve();

export const build = async (watch: boolean = false) => {
  const pkg = readFileSync(path.join(dirName, "package.json"));
  const { main, source } = JSON.parse(pkg.toString());
  const infile = path.join(dirName, source);
  const outfile = path.join(dirName, main);

  await esbuild.build({
    legalComments: "none",
    define: {
      process: JSON.stringify({
        env: {
          NODE_ENV: "production",
          DEBUG: false,
        },
      }),
    },
    outfile,
    entryPoints: [infile],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    target: "chrome100",
    plugins: [
      globalExternals({
        "@solana/web3.js": {
          varName: "globalThis.solanaWeb3",
          type: "cjs",
        },
      }),
    ],
    loader: { ".js": "jsx" },
    external: ["require", "fs", "path", "os", "process"],
    watch,
  });

  console.info(
    `🎉 bundled ${outfile} (${(statSync(outfile).size / 1024).toFixed(3)} KB)`
  );
};
