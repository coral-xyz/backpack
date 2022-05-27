import esbuild from "esbuild";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import { existsSync, statSync } from "fs";
import path from "path";

export const build = async (inputFile: string, args?: { output?: string }) => {
  const infile = path.join(path.resolve(), inputFile);
  const outfile = args?.output || "dist/bundle.js";

  if (!existsSync(infile)) throw new Error(`(${infile}) not found`);

  await esbuild.build({
    outfile,
    entryPoints: [infile],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
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
    `🎉 bundled ${outfile} (${(
      statSync(path.join(path.resolve(), outfile)).size / 1024
    ).toFixed(3)} KB)`
  );
};
