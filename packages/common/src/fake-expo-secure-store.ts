// this is loaded instead of `expo-secure-store` if this package is loaded
// outside react-native. This is necessary because it has react-native
// dependencies which are incompatible with standard react code.

// NOTE this is just a stub for the native AsyncStorage wrapper
let MEM_STORAGE = {};
const AsyncStorage = {
  getItem: (key: string) => Promise.resolve(MEM_STORAGE[key]),
  setItem: (key: string, value: any) => {
    MEM_STORAGE[key] = value;
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    delete MEM_STORAGE[key];
    return Promise.resolve();
  },
  clear: () => {
    MEM_STORAGE = {};
    return Promise.resolve();
  },
};

export default AsyncStorage;
