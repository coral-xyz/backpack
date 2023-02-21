import type { FEATURE_GATES_MAP } from "@coral-xyz/common";
import {
  buildFullFeatureGatesMap,
  UI_RPC_METHOD_GET_FEATURE_GATES,
} from "@coral-xyz/common";
import { selector } from "recoil";

import { equalAtom } from "../equals";

import { backgroundClient } from "./client";

export const featureGates = equalAtom<FEATURE_GATES_MAP>({
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
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});
