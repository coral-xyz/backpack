import { getLogger } from "../logging";
const logger = getLogger("ab1:AsyncStorage:web");
// NOTE this is just a stub for the native AsyncStorage wrapper
interface SecureDB {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  reset: () => Promise<void>;
}

export class SecureStorage implements SecureDB {
  async get(key: string): Promise<string | null> {
    logger.debug("getItem", key);
    return localStorage.getItem(key);
  }

  async set(key: string, value: any): Promise<void> {
    logger.debug("setItem", key, value);
    return localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    return localStorage.removeItem(key);
  }

  async reset(): Promise<void> {
    return localStorage.clear();
  }
}
