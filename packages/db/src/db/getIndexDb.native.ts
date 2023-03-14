/*
 * This is added to instruct dexie to use
 * the shimmed indexedDB
 * https://github.com/dexie/Dexie.js/issues/354#issuecomment-714642331
 */
export const getIndexDb = () => ({
  // @ts-ignore
  indexedDB: global.window.indexedDB,
});
