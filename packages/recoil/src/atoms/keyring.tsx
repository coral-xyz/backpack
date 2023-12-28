import { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { selector } from "recoil";

import { rawSecureUserAtom } from "./secure-client";

/**
 * Whether the users keyring has a mnemonic configured.
 */
export const keyringHasMnemonic = selector<boolean>({
  key: "keyringHasMnemonic",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return false;
    } else {
      return user.user.hasMnemonic;
    }
  },
});
