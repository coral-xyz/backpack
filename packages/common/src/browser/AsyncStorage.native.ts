import RNAsyncStorage from "@react-native-async-storage/async-storage";

import { getLogger } from "../logging";
const logger = getLogger("ab1:AsyncStorage:native");

interface SecureDB {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  reset: () => Promise<void>;
}

export class SecureStorage implements SecureDB {
  async get(key: string): Promise<any> {
    logger.debug("getItem", key);
    try {
      // @ts-ignore
      const raw = await RNAsyncStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.log("ab1:native.ts:getItem:error", e);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    logger.debug("setItem", key, value);
    // @ts-ignore
    return RNAsyncStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    // @ts-ignore
    return RNAsyncStorage.removeItem(key);
  }

  async reset(): Promise<void> {
    // @ts-ignore
    return RNAsyncStorage.clear();
  }
}
