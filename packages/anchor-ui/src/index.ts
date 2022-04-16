import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorUi } from "./reconciler";

export * from "./elements";
export default AnchorUi;
export { NodeSerialized, TextSerialized } from "./reconciler";

export interface AppContext {
  connection: Connection;
  publicKey: PublicKey;
}

export function context(): AppContext {
  // @ts-ignore
  return window.anchor;
}
