import RNAsyncStorage from "@react-native-async-storage/async-storage";

interface SecureDB {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  reset: () => Promise<void>;
}

export class SecureStorage implements SecureDB {
  async get(key: string): Promise<string | null> {
    console.log("z1:native.ts:getItem");
    // @ts-ignore
    return RNAsyncStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    console.log("z1:native.ts:setItem");
    // @ts-ignore
    return RNAsyncStorage.setItem(key, value);
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
