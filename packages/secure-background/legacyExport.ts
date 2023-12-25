import { extensionDB, SecureStore } from "./src/store/SecureStore";

export { keyringForBlockchain, mnemonicPathToPrivateKey } from "./src/keyring";
export type { BlockchainKeyring } from "./src/keyring/BlockchainKeyring";
export { sanitizeTransactionWithFeeConfig } from "./src/services/svm/util";
export { KeyringStore } from "./src/store/KeyringStore/KeyringStore";
export type { User } from "./src/store/SecureStore";
export { extensionDB } from "./src/store/SecureStore";

export const secureStore = new SecureStore(extensionDB);
