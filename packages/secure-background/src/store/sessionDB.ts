import { BrowserRuntimeCommon } from "@coral-xyz/common";

import type { SecureDB, SecureDBValue } from "./SecureStore";
import { SessionStorageKeys } from "./storageKeys";

type SessionStorageType = Partial<Record<SessionStorageKeys, SecureDBValue>>;

const storageKeys = Object.values(SessionStorageKeys);

let memCache: SessionStorageType = {};

export const sessionDB: SecureDB<SessionStorageKeys> = {
  async export(): Promise<SessionStorageType> {
    memCache = await BrowserRuntimeCommon.getAllSessionStorage();
    return memCache;
  },

  async import(items: SessionStorageType): Promise<void> {
    memCache = items;
    return await BrowserRuntimeCommon.setAllSessionStorage(items);
  },

  async get<V extends SecureDBValue>(
    key: SessionStorageKeys
  ): Promise<V | undefined> {
    if (!memCache[key]) {
      memCache[key] = await BrowserRuntimeCommon.getSessionStorage(key);
    }
    return memCache[key] as V;
  },

  async set(key: SessionStorageKeys, value: SecureDBValue): Promise<void> {
    await BrowserRuntimeCommon.setSessionStorage(key, value);
    memCache[key] = value;
  },

  async remove(key: SessionStorageKeys): Promise<void> {
    await BrowserRuntimeCommon.removeSessionStorage(key);
    delete memCache[key];
  },

  async reset(): Promise<void> {
    memCache = {};
    await BrowserRuntimeCommon.clearSessionStorage(storageKeys as string[]);
  },
};
