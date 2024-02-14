import * as SecureStore from "expo-secure-store";

const SecureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: unknown) =>
    SecureStore.setItemAsync(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    ),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  clear: async (keys: string[]) => {
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
  },
};

export default SecureStorage;
