import type { ChannelAppUiClient } from "@coral-xyz/common";
import {
  buildFullFeatureGatesMap,
  UI_RPC_METHOD_SET_FEATURE_GATES,
} from "@coral-xyz/common";

const FEATURE_GATE_URL = "https://feature-gates.xnfts.dev";

export const refreshFeatureGates = async (background: ChannelAppUiClient) => {
  try {
    const res = await fetch(`${FEATURE_GATE_URL}/gates`);
    const json = await res.json();
    if (!json.gates) throw new Error(json.message);
    const gates = buildFullFeatureGatesMap(json.gates);
    await background.request({
      method: UI_RPC_METHOD_SET_FEATURE_GATES,
      params: [gates],
    });
  } catch (e) {
    console.warn(
      `Error while refreshing feature gates, falling back to defaults`
    );
  }
};
