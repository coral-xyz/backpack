import { BrowserRuntimeCommon } from "@coral-xyz/common";

export class LocalStorageDb {
  static async get(key: string): Promise<any> {
    return await BrowserRuntimeCommon.getLocalStorage(key);
  }

  static async set(key: string, value: any): Promise<void> {
    await BrowserRuntimeCommon.setLocalStorage(key, value);
  }

  static async reset(): Promise<void> {
    await BrowserRuntimeCommon.clearLocalStorage();
  }
}
