// NOTE this is just a stub for the native AsyncStorage wrapper
// interface S {
//   getItem: (key: string) => Promise<any>;
//   setItem: (key: string, value: any) => Promise<void>;
//   removeItem: (key: string) => Promise<void>;
//   clear: () => Promise<void>;
// }

const AsyncStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: any) =>
    Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
  clear: () => Promise.resolve(localStorage.clear()),
};

export default AsyncStorage;
