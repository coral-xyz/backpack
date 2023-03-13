export const getIndexDb = () => ({
  // @ts-ignore
  indexedDB: global.window.indexedDB,
});
