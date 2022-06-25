import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await build({
    bundle: true,
    sourcemap: true,
    format: "esm",
    target: "esnext",
    external: ["__STATIC_CONTENT_MANIFEST"],
    conditions: ["worker", "browser"],
    entryPoints: [join(__dirname, "src", "index.ts")],
    outdir: join(__dirname, "dist"),
    outExtension: { ".js": ".mjs" },
  });
} catch {
  process.exitCode = 1;
}
