import { extensionDB, SecureStore } from "./src/store/SecureStore";

export { extensionDB } from "./src/store/SecureStore";

export const secureStore = new SecureStore(extensionDB);
