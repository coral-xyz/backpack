export function isPromise(p: any): p is Promise<any> {
  return !!p && typeof p.then === "function";
}
