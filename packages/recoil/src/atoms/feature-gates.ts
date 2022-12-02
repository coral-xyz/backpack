import type { FEATURE_GATES_MAP } from "@coral-xyz/common";
import {
  buildFullFeatureGatesMap,
  UI_RPC_METHOD_GET_FEATURE_GATES,
} from "@coral-xyz/common";
import { atom, selector } from "recoil";

import { backgroundClient } from "./client";

export const featureGates = selector<FEATURE_GATES_MAP>({
  key: "featureGates",
  get: async ({ get }) => {
    const background = get(backgroundClient);
    const response = await background.request({
      method: UI_RPC_METHOD_GET_FEATURE_GATES,
      params: [],
    });
    const gates = buildFullFeatureGatesMap(response);
    return gates;
  },
});
