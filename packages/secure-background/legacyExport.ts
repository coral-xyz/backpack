import * as isCold from "./src/store/isCold";
import * as keyname from "./src/store/keyname";
import * as preferences from "./src/store/preferences";
import * as usernames from "./src/store/usernames";

export { keyringForBlockchain, mnemonicPathToPrivateKey } from "./src/keyring";
export type { BlockchainKeyring } from "./src/keyring/blockchain";
export {
  KeyringStore,
  type KeyringStoreState,
  KeyringStoreStateEnum,
} from "./src/store/keyring";
export type { User } from "./src/store/usernames";

export const secureStore = {
  ...isCold,
  ...preferences,
  ...usernames,
  ...keyname,
};
