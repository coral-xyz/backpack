import type { FEATURE_GATES_MAP } from "@coral-xyz/common";

import { LocalStorageDb } from "./db";

const KEY_FEATURE_GATES_STORE = "feature-gates-store";

export async function getFeatureGates(): Promise<FEATURE_GATES_MAP> {
  return await LocalStorageDb.get(KEY_FEATURE_GATES_STORE);
}

export async function setFeatureGates(gates: FEATURE_GATES_MAP) {
  await LocalStorageDb.set(KEY_FEATURE_GATES_STORE, gates);
}
