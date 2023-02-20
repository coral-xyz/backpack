// This "store" module defines all the persistent model objects for the storage
// layer of the app.

import { LocalStorageDb } from "./db";

export * from "./db";
export * from "./feature-gates";
export * from "./isCold";
export * from "./keyname";
export * from "./keyring";
export * from "./navigation";
export * from "./preferences";
export * from "./usernames";
export * from "./xnft-preferences";

export function reset() {
  return LocalStorageDb.reset();
}
