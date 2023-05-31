/* eslint-disable import/no-namespace */

import * as isCold from "./localstore/isCold";
import * as keyname from "./localstore/keyname";
import * as preferences from "./localstore/preferences";
import * as usernames from "./localstore/usernames";

export { keyringForBlockchain, mnemonicPathToPrivateKey } from "./keyring";
export type { BlockchainKeyring } from "./keyring/blockchain";
export { KeyringStore } from "./localstore/keyring";
export type { User } from "./localstore/usernames";

export const secureStore = {
  ...isCold,
  ...preferences,
  ...usernames,
  ...keyname,
};
