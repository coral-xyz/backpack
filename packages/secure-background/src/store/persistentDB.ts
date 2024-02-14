import { BrowserRuntimeCommon } from "@coral-xyz/common";

import type { SecureDB, SecureDBValue } from "./SecureStore";
import type { PersistentStorageKeys } from "./storageKeys";

type PersistentStorageType = Partial<
  Record<PersistentStorageKeys, SecureDBValue>
>;

let memCache: PersistentStorageType = {};

export const persistentDB: SecureDB<PersistentStorageKeys> = {
  async export(): Promise<PersistentStorageType> {
    memCache = await BrowserRuntimeCommon.getAllLocalStorage();
    return memCache;
  },

  async import(items: PersistentStorageType): Promise<void> {
    memCache = items;
    return await BrowserRuntimeCommon.setAllLocalStorage(items);
  },

  async get<V extends SecureDBValue>(
    key: PersistentStorageKeys
  ): Promise<V | undefined> {
    if (!memCache[key]) {
      memCache[key] = await BrowserRuntimeCommon.getLocalStorage(key);
    }
    return memCache[key] as V;
  },

  async set(key: PersistentStorageKeys, value: SecureDBValue): Promise<void> {
    await BrowserRuntimeCommon.setLocalStorage(key, value);
    memCache[key] = value;
  },

  async remove(key: PersistentStorageKeys): Promise<void> {
    await BrowserRuntimeCommon.removeLocalStorage(key);
    delete memCache[key];
  },

  async reset(): Promise<void> {
    memCache = {};
    await BrowserRuntimeCommon.clearLocalStorage();
  },
};
