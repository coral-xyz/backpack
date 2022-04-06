let RUNTIME: any = null;
import("wasm").then((r) => {
  RUNTIME = r;
  console.log("RUNTIME", RUNTIME);
});

export async function runtime() {
  console.log("r here", RUNTIME);
}
