import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const env = process.env.NODE_ENV;

export default {
  input: "src/index.ts",
  plugins: [
    json(),
    commonjs(),
    nodeResolve({
      browser: true,
      extensions: [".js", ".ts"],
      dedupe: ["bn.js", "buffer"],
      preferBuiltins: false,
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      moduleResolution: "node",
      outDir: "types",
      target: "es2019",
      outputToFilesystem: false,
    }),
    replace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify(env),
        "process.env.BROWSER": JSON.stringify(true),
        "process.env.DEFAULT_SOLANA_CONNECTION_URL": JSON.stringify(
          process.env.DEFAULT_SOLANA_CONNECTION_URL || ""
        ),
      },
    }),
    terser(),
  ],
  output: {
    file: "dist/browser/index.js",
    format: "es",
    sourcemap: true,
  },
};
