// This "store" module defines all the persistent model objects for the storage
// layer of the app.

import { LocalStorageDb } from "./db";

export * from "./db";
export * from "./feature-gates";
export * from "./keyname";
export * from "./keyring";
export * from "./navigation";
export * from "./preferences";
export * from "./xnft-preferences";
export * from "./usernames";

export function reset() {
  return LocalStorageDb.reset();
}
