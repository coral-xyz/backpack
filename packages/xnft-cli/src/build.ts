import esbuild from "esbuild";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import { existsSync, statSync } from "fs";
import path from "path";

export const build = async (args: { input: string; output: string }) => {
  const file = path.join(path.resolve(), args.input);

  if (!existsSync(file)) throw new Error(`(${file}) not found`);

  await esbuild.build({
    outfile: args.output,
    entryPoints: [file],
    bundle: true,
    minify: true,
    format: "esm",
    plugins: [
      globalExternals({
        react: {
          varName: "window.libs.React",
          type: "cjs",
        },
        "react-dom": {
          varName: "window.libs.ReactDOM",
          type: "esm",
          namedExports: ["render"],
        },
        "@200ms/anchor-ui": {
          varName: "window.libs.AnchorUI",
          type: "cjs",
        },
        "@solana/web3.js": {
          varName: "window.libs.Solana",
          type: "cjs",
          // namedExports: ["Keypair"],
        },
        "@project-serum/anchor": {
          varName: "window.libs.Anchor",
          type: "cjs",
        },
      }),
    ],
    loader: { ".js": "jsx" },
    external: ["require", "fs", "path", "os"],
  });

  console.info(
    `🎉 bundled ${args.output} (${(
      statSync(path.join(path.resolve(), args.output)).size / 1024
    ).toFixed(3)} KB)`
  );
};
