import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    exports: "named",
    format: "es",
    file: "dist/index.mjs",
    sourcemap: true,
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({ browser: true, preferBuiltins: false }),
    terser(),
  ],
};
