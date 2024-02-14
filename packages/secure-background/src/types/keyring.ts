import type { Blockchain } from "@coral-xyz/common";

export enum KeyringStoreState {
  "Locked" = "locked",
  "Unlocked" = "unlocked",
  "NeedsOnboarding" = "needs-onboarding",
}

export type KeyringTypes =
  | "hdPublicKeys"
  | "importedPublicKeys"
  | "ledgerPublicKeys";

export type UserPublicKeys = Record<
  Blockchain,
  Record<KeyringTypes, Array<string>>
>;
