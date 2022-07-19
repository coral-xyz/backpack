const MEM_STORAGE: Record<string, string> = {};

export const getItemAsync = (key: keyof typeof MEM_STORAGE): Promise<string> =>
  new Promise((res, rej) => {
    const result = MEM_STORAGE[key];
    res(result);
  });

export const setItemAsync = (key: string, value: string) =>
  new Promise((res) => {
    MEM_STORAGE[key] = value;
    res(null);
  });
