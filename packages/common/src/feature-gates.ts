export const PRIMARY_PUBKEY_ENABLED = "PRIMARY_PUBKEY_ENABLED";
export const STRIPE_ENABLED = "STRIPE_ENABLED";

// Used as a fallback if feature gates worker is offline
export const DEFAULT_FEATURE_GATES = {
  BARTER_ENABLED: false,
  DROPZONE_ENABLED: false,
  GQL_BALANCES: false,
  GQL_NOTIFICATIONS: true,
  GQL_TRANSACTION_HISTORY: false,
  MESSAGING_ENABLED: true,
  PRIMARY_PUBKEY_ENABLED: true,
  STICKER_ENABLED: false,
  STRIPE_ENABLED: false,
  SWAP_FEES_ENABLED: false,
} as const;

export type FEATURE_GATES_MAP = typeof DEFAULT_FEATURE_GATES;

/*
 * To avoid any runtime errors because of corrupt data in the
 * local DB, we clean the gates map here and return it.
 */
export const buildFullFeatureGatesMap = (featureGates: any) => {
  let gates = {};
  Object.keys(DEFAULT_FEATURE_GATES).map((feature) => {
    gates[feature] = featureGates?.[feature] ?? DEFAULT_FEATURE_GATES[feature];
  });
  return gates as FEATURE_GATES_MAP;
};
