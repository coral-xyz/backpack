export type FEATURE_GATES_MAP = { [feature: string]: boolean };

export const STRIPE_ENABLED = "STRIPE_ENABLED";

export const DEFAULT_FEATURE_GATES: FEATURE_GATES_MAP = {
  STRIPE_ENABLED: false,
};

/*
 * To avoid any runtime errors because of corrupt data in the
 * local DB, we clean the gates map here and return it.
 */
export const buildFullFeatureGatesMap = (featureGates: any) => {
  let gates: FEATURE_GATES_MAP = {};
  Object.keys(DEFAULT_FEATURE_GATES).map((feature) => {
    gates[feature] = featureGates?.[feature] ?? DEFAULT_FEATURE_GATES[feature];
  });
  return gates;
};
