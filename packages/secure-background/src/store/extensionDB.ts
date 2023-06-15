import { BrowserRuntimeCommon } from "@coral-xyz/common";

import type { SecureDB } from "./SecureStore";

export const extensionDB: SecureDB = {
  async get(key: string): Promise<any> {
    return await BrowserRuntimeCommon.getLocalStorage(key);
  },

  async set(key: string, value: any): Promise<void> {
    await BrowserRuntimeCommon.setLocalStorage(key, value);
  },

  async remove(key: string): Promise<void> {
    await BrowserRuntimeCommon.removeLocalStorage(key);
  },

  async reset(): Promise<void> {
    await BrowserRuntimeCommon.clearLocalStorage();
  },
};
