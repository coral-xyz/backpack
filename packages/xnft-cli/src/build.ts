import esbuild from "esbuild";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import path from "path";

const dirName = path.resolve();

export const build = async (inputFile: string, args?: { output?: string }) => {
  const pkg = readFileSync(path.join(dirName, "package.json"));
  const { main, source } = JSON.parse(pkg.toString());

  const infile = (() => {
    if (inputFile) {
      const file = path.join(dirName, inputFile);
      if (existsSync(file)) {
        return file;
      } else {
        throw new Error(`(${file}) not found`);
      }
    } else {
      return path.join(dirName, source);
      // return source;
    }
  })();

  const outfile = (() => {
    let fullPath = args?.output;

    if (!fullPath) {
      fullPath = path.join(dirName, main);
    }

    mkdirSync(fullPath!.split("/").slice(0, -1).join("/"), { recursive: true });

    return fullPath;
  })();

  await esbuild.build({
    outfile,
    entryPoints: [infile],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    target: "chrome100",
    plugins: [
      globalExternals({
        // react: {
        //   varName: "window.libs.React",
        //   type: "cjs",
        // },
        // "@200ms/anchor-ui": {
        //   varName: "window.libs.AnchorUI",
        //   type: "cjs",
        // },
        // "@solana/web3.js": {
        //   varName: "window.libs.Solana",
        //   type: "cjs",
        // },
        // "@project-serum/anchor": {
        //   varName: "window.libs.Anchor",
        //   type: "cjs",
        // },
      }),
    ],
    loader: { ".js": "jsx" },
    external: ["require", "fs", "path", "os"],
  });

  console.info(
    `🎉 bundled ${outfile} (${(statSync(outfile).size / 1024).toFixed(3)} KB)`
  );
};
