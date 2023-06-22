// this is loaded instead of `expo-secure-store` if this package is loaded
// outside react-native. This is necessary because it has react-native
// dependencies which are incompatible with standard react code.

let MEM_STORAGE = {};
const AsyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    return new Promise((res) => {
      MEM_STORAGE[key] = value;
      res();
    });
  },
  getItem: async (key: string): Promise<string | null> => {
    return new Promise((res) => {
      const result = MEM_STORAGE[key];
      res(result);
    });
  },
  removeItem: async (key: string): Promise<void> => {
    return new Promise((res) => {
      delete MEM_STORAGE[key];
      res();
    });
  },
  clear: async (): Promise<void> => {
    return new Promise((res) => {
      MEM_STORAGE = {};
      res();
    });
  },
};

export default AsyncStorage;
