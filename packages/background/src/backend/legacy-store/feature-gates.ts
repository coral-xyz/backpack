import type { FEATURE_GATES_MAP } from "@coral-xyz/common";
import { PersistentStorageKeys } from "@coral-xyz/secure-clients";

import { LocalStorageDb } from "./db";


export async function getFeatureGates(): Promise<FEATURE_GATES_MAP | undefined> {
  return LocalStorageDb.get<FEATURE_GATES_MAP>(PersistentStorageKeys.KEY_FEATURE_GATES_STORE);
}

export async function setFeatureGates(gates: FEATURE_GATES_MAP) {
  await LocalStorageDb.set(PersistentStorageKeys.KEY_FEATURE_GATES_STORE, gates);
}
