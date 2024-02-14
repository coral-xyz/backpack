import RNAsyncStorage from "@react-native-async-storage/async-storage";

const AsyncStorage = {
  getItem: (key: string) => RNAsyncStorage.getItem(key),
  setItem: (key: string, value: any) => RNAsyncStorage.setItem(key, value),
  removeItem: (key: string) => RNAsyncStorage.removeItem(key),
  clear: async () => {
    try {
      const keys = await RNAsyncStorage.getAllKeys();

      await RNAsyncStorage.multiRemove(keys);
    } catch {
      // quiet.
    }
    // TODO: RNAsyncStorage.clear() is not always sufficient, this might need
    // revisiting for android            https://stackoverflow.com/a/46739760
    try {
      await RNAsyncStorage.clear();
    } catch {
      // quiet.
    }
  },
};

export default AsyncStorage;
