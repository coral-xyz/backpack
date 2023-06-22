// this is loaded instead of `expo-secure-store` if this package is loaded
// outside react-native. This is necessary because it has react-native
// dependencies which are incompatible with standard react code.

// NOTE this is just a stub for the native AsyncStorage wrapper
export default class SecureStorage {
  async getItem(key: string): Promise<string | null> {
    console.log("z1:web.ts:getItem");
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log("z1:web.ts:setItem");
    return localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    return localStorage.clear();
  }
}
