import { atom, atomFamily, selector, selectorFamily } from "recoil";
import {
  UI_RPC_METHOD_NAVIGATION_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@200ms/common";
import { getBackgroundClient } from "../background";
import { bootstrapFast } from "../atoms";
import { TABS } from "../types";

export const navigationActiveTab = atom<string>({
  key: "navigationActiveTab",
  default: selector({
    key: "navigationActiveTabDefault",
    get: ({ get }: any) => {
      const bs = get(bootstrapFast);
      return bs.activeTab;
    },
  }),
  effects: [
    ({ onSet }) => {
      onSet((activeTab) => {
        const background = getBackgroundClient();
        return background.request({
          method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
          params: [activeTab],
        });
      });
    },
  ],
});

/**
 * Each atom in the family represents a single navigation stack. This is used
 * to persistently keep track of the UI state the user left the tab in, so that
 * when the user switches back and forth, the state doesn't reset.
 */
export const navigationDataMap = atomFamily<any, string>({
  key: "navigationState",
  default: selectorFamily({
    key: "navigationStateDefault",
    get:
      (navKey: string) =>
      ({ get }: any) => {
        const { tabs } = get(bootstrapFast);
        // @ts-ignore
        return tabs.filter((t) => t && t.id === navKey)[0];
      },
  }),
  effects: (_nav: string) => [
    ({ onSet }) => {
      onSet((navData) => {
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_NAVIGATION_UPDATE,
            params: [navData],
          })
          .catch(console.error);
      });
    },
  ],
});

export const navigationData = selector({
  key: "navigationData",
  get: ({ get }) => {
    const tabData = {};
    TABS.forEach(([tab]) => {
      tabData[tab] = get(navigationDataMap(tab));
    });
    return tabData;
  },
});

export const navigationRightButton = atom<any | null>({
  key: "navigationRightButton",
  default: null,
});
