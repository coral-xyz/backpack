import { atom, selector } from "recoil";
import { UI_RPC_METHOD_KEYRING_STORE_STATE } from "@coral-xyz/common";
import { backgroundClient } from "./client";

export type KeyringStoreState =
  | "locked"
  | "unlocked"
  | "needs-beta-invite-code" // MARK: beta
  | "needs-onboarding";

export const KeyringStoreStateEnum: { [key: string]: KeyringStoreState } = {
  Locked: "locked",
  Unlocked: "unlocked",
  NeedsBetaInviteCode: "needs-beta-invite-code", // MARK: beta
  NeedsOnboarding: "needs-onboarding",
};

/**
 * Status of the keyring store.
 */
export const keyringStoreState = atom<KeyringStoreState | null>({
  key: "keyringStoreState",
  default: selector({
    key: "keyringStoreStateDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_STATE,
        params: [],
      });
    },
  }),
});
