let RUNTIME: any = null;
import("wasm").then((r) => {
  RUNTIME = r;
});

export async function runtime() {
  console.log("r here", RUNTIME);
}
