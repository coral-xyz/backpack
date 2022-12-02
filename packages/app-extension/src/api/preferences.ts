import type { ChannelAppUiClient } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  UI_RPC_METHOD_SET_XNFT_PREFERENCES,
} from "@coral-xyz/common";

export const refreshXnftPreferences = async (
  background: ChannelAppUiClient
) => {
  try {
    const res = await fetch(`${BACKEND_API_URL}/preferences`);
    const json = await res.json();
    if (!json.xnftPreferences) throw new Error(json.message);
    json.xnftPreferences.map(async (xnftPreference: any) => {
      await background.request({
        method: UI_RPC_METHOD_SET_XNFT_PREFERENCES,
        params: [
          xnftPreference.xnftId,
          {
            notifications: xnftPreference.notifications || false,
          },
        ],
      });
    });
  } catch (e) {
    console.warn(`Error while refreshing xnft preferences ${e}`);
  }
};

export const updateRemotePreference = (
  xnftId: string,
  username: string,
  preferences: { notifications: boolean }
) => {
  return fetch(`${BACKEND_API_URL}/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      xnftId: xnftId,
      preferences,
    }),
  });
};
