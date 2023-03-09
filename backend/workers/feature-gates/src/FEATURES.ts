import type { FEATURE_GATES_MAP } from "@coral-xyz/common";

export const FEATURE_GATES = {
  STRIPE_ENABLED: true,
  PRIMARY_PUBKEY_ENABLED: true,
  SWAP_FEES_ENABLED: false,
  DROPZONE_ENABLED: false,
  STICKER_ENABLED: false,
  BARTER_ENABLED: false,
} satisfies {
  // ensure all keys are present
  [feature in keyof FEATURE_GATES_MAP]: boolean;
};
