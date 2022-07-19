// this is loaded instead of `expo-secure-store` if this package is loaded
// outside react-native. This is necessary because it has react-native
// dependencies which are incompatible with standard react code.

const MEM_STORAGE = {};

export const deleteItemAsync = (key: string): Promise<void> =>
  new Promise((res) => {
    delete MEM_STORAGE[key];
    res();
  });

export const getItemAsync = (key: string): Promise<string | null> =>
  new Promise((res) => {
    const result = MEM_STORAGE[key];
    res(result);
  });

export const setItemAsync = (key: string, value: string): Promise<void> =>
  new Promise((res) => {
    MEM_STORAGE[key] = value;
    res();
  });
