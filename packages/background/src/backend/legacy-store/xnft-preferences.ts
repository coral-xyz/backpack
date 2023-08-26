import type { XnftPreferenceStore } from "@coral-xyz/common";

import { LocalStorageDb } from "./db";

const KEY_XNFT_PREFERENCES_STORE = "xnft-preferences-store";

export async function getXnftPreferencesForUser(
  uuid: string
): Promise<XnftPreferenceStore> {
  return await LocalStorageDb.get(key(uuid));
}

export async function setXnftPreferencesForUser(
  uuid: string,
  preferences: XnftPreferenceStore
) {
  await LocalStorageDb.set(key(uuid), preferences);
}

function key(uuid: string): string {
  return `${KEY_XNFT_PREFERENCES_STORE}_${uuid}`;
}
