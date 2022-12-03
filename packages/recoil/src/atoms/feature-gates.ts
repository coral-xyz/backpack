import type { FEATURE_GATES_MAP } from "@coral-xyz/common";
import {
  buildFullFeatureGatesMap,
  UI_RPC_METHOD_GET_FEATURE_GATES,
  UI_RPC_METHOD_PREFERENCES_READ,
} from "@coral-xyz/common";
import { atom, selector } from "recoil";

import { backgroundClient } from "./client";

export const featureGates = atom<FEATURE_GATES_MAP>({
  key: "featureGates",
  default: selector({
    key: "featureGatesDefaults",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      const response = await background.request({
        method: UI_RPC_METHOD_GET_FEATURE_GATES,
        params: [],
      });
      const gates = buildFullFeatureGatesMap(response);
      return gates;
    },
  }),
});
