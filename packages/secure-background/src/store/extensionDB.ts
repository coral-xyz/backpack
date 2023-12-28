import { BrowserRuntimeCommon } from "@coral-xyz/common";

import type { SecureDB } from "./SecureStore";

let memCache: { [key: string]: any } = {};

export const extensionDB: SecureDB = {
  async export(): Promise<{ [key: string]: any }> {
    memCache = await BrowserRuntimeCommon.getAllLocalStorage();
    return memCache;
  },

  async import(items: { [key: string]: any }): Promise<void> {
    memCache = items;
    return await BrowserRuntimeCommon.setAllLocalStorage(items);
  },

  async get(key: string): Promise<any> {
    if (!memCache[key]) {
      memCache[key] = await BrowserRuntimeCommon.getLocalStorage(key);
    }
    return memCache[key];
  },

  async set(key: string, value: any): Promise<void> {
    await BrowserRuntimeCommon.setLocalStorage(key, value);
    memCache[key] = value;
  },

  async remove(key: string): Promise<void> {
    await BrowserRuntimeCommon.removeLocalStorage(key);
    delete memCache[key];
  },

  async reset(): Promise<void> {
    await BrowserRuntimeCommon.clearLocalStorage();
    memCache = {};
  },
};
