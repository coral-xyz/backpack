import { getLogger } from "./logging";
const logger = getLogger("ab1:AsyncStorage:expo-fake");

// this is loaded instead of `expo-secure-store` if this package is loaded
// outside react-native. This is necessary because it has react-native
// dependencies which are incompatible with standard react code.

// NOTE this is just a stub for the native AsyncStorage wrapper
export default class SecureStorage {
  async getItem(key: string): Promise<string | null> {
    logger.debug("getItem", key);
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: any): Promise<void> {
    logger.debug("setItem", key, value);
    return localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    return localStorage.clear();
  }
}
