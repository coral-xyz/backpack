import { atom } from "recoil";
import { getBackgroundClient } from "../background/client";
import {
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
} from "../common";

/**
 * Toggle for darkmode.
 */
export const isDarkMode = atom<boolean | null>({
  key: "isDarkMode",
  default: null,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
          params: [],
        })
      );
    },
    ({ onSet }) => {
      onSet((darkMode: boolean | null) => {
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
            params: [darkMode],
          })
          .catch(console.error);
      });
    },
  ],
});
