import { LocalStorageDb } from "./db";
import { XnftPreferenceStore } from "@coral-xyz/common";

const KEY_XNFT_PREFERENCES_STORE = "xnft-preferences-store";

export async function getXnftPreferences(): Promise<XnftPreferenceStore> {
  return await LocalStorageDb.get(KEY_XNFT_PREFERENCES_STORE);
}

export async function setXnftPreferences(preferences: XnftPreferenceStore) {
  await LocalStorageDb.set(KEY_XNFT_PREFERENCES_STORE, preferences);
}
