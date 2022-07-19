const MEM_STORAGE = {};

export const getItemAsync = (key: string): Promise<string | null> =>
  new Promise((res, rej) => {
    const result = MEM_STORAGE[key];
    res(result);
  });

export const setItemAsync = (key: string, value: string): Promise<void> =>
  new Promise((res) => {
    MEM_STORAGE[key] = value;
    res();
  });
