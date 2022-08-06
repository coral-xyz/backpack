export class LocalStorage {
  public static async get<T = any>(key: string): Promise<T> {
    return await window.xnft.getStorage(key);
  }

  public static async setStorage<T = any>(key: string, value: T): Promise<T> {
    return await window.xnft.setStorage(key, value);
  }
}
