// This "store" module defines all the persistent model objects for the storage
// layer of the app.

import { LocalStorageDb } from "./db";

export * from "./feature-gates";
export { getIsCold, setIsCold } from "./isCold";
export { DefaultKeyname, getKeyname, setKeyname } from "./keyname";
export {
  doesCiphertextExist,
  getKeyringStore,
  getKeyringStore_NO_MIGRATION,
  type KeyringStoreJson,
  setKeyringStore,
  type UserKeyringJson,
} from "./keyring";
export { getNav, type Nav, setNav } from "./navigation";
export { getWalletDataForUser, setWalletDataForUser } from "./preferences";
export * from "./usernames";
export * from "./xnft-preferences";

export function reset() {
  return LocalStorageDb.reset();
}
