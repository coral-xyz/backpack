import { extensionDB, SecureStore } from "./src/store/SecureStore";

export { keyringForBlockchain, mnemonicPathToPrivateKey } from "./src/keyring";
export type { BlockchainKeyring } from "./src/keyring/blockchain";
export { sanitizeTransactionWithFeeConfig } from "./src/services/svm/util";
export { KeyringStore } from "./src/store/keyring";
export type { User } from "./src/store/SecureStore";
export { extensionDB } from "./src/store/SecureStore";

export const secureStore = new SecureStore(extensionDB);