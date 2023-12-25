import type { Preferences } from "@coral-xyz/common";

import type { User, UserPublicKeyStore } from "../store/SecureStore";

export type SecureUserType = {
  user: User;
  allUsers: Array<User>;
  preferences: Preferences;
  publicKeys: null | UserPublicKeyStore[string];
};
