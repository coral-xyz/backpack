export const getItemAsync = (key: string): Promise<string | null> =>
  new Promise((res, rej) => res(""));

export const setItemAsync = (key: string, value: string): Promise<void> =>
  new Promise(() => null);
