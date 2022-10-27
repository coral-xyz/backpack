import { atom, selector } from "recoil";
import { backgroundClient } from "./client";
import {
  UI_RPC_METHOD_GET_FEATURE_GATES,
  FEATURE_GATES_MAP,
  buildFullFeatureGatesMap,
} from "@coral-xyz/common";

export const featureGates = atom<FEATURE_GATES_MAP>({
  key: "featureGates",
  default: selector({
    key: "featureGatesDefault",
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
