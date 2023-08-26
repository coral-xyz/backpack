import RNAsyncStorage from "@react-native-async-storage/async-storage";

const AsyncStorage = {
  getItem: (key: string) => RNAsyncStorage.getItem(key),
  setItem: (key: string, value: any) => RNAsyncStorage.setItem(key, value),
  removeItem: (key: string) => RNAsyncStorage.removeItem(key),
  clear: () => RNAsyncStorage.clear(),
};

export default AsyncStorage;
