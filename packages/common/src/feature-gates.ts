export const STRIPE_ENABLED = "STRIPE_ENABLED";
export const PRIMARY_PUBKEY_ENABLED = "PRIMARY_PUBKEY_ENABLED";
export const NOTIFICATIONS_ENABLED = "NOTIFICATIONS_ENABLED";
export const MESSAGES_ENABLED = "MESSAGES_ENABLED";
export const MESSAGE_IFRAME_ENABLED = "MESSAGE_IFRAME_ENABLED";
export const OFFLINE_IMAGES = "OFFLINE_IMAGES";
export const SWAP_FEES_ENABLED = "SWAP_FEES_ENABLED";

// Used as a fallback if feature gates worker is offline
export const DEFAULT_FEATURE_GATES = {
  STRIPE_ENABLED: false,
  NOTIFICATIONS_ENABLED: false,
  MESSAGES_ENABLED: true,
  MESSAGE_IFRAME_ENABLED: false,
  OFFLINE_IMAGES: true,
  PRIMARY_PUBKEY_ENABLED: true,
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
