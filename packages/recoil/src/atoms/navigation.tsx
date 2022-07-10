import { atom, atomFamily, selector, selectorFamily } from "recoil";
import {
  UI_RPC_METHOD_NAVIGATION_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@coral-xyz/common";
import { bootstrapFast } from "./bootstrap";
import { backgroundClient } from "./background";

//
// The tab currently selected.
//
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
    ({ onSet, getPromise }) => {
      onSet((activeTab) => {
        (async () => {
          const background = await getPromise(backgroundClient);
          return await background.request({
            method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
            params: [activeTab],
          });
        })();
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
    ({ onSet, getPromise }) => {
      onSet((navData) => {
        (async () => {
          const background = await getPromise(backgroundClient);
          await background
            .request({
              method: UI_RPC_METHOD_NAVIGATION_UPDATE,
              params: [navData],
            })
            .catch(console.error);
        })();
      });
    },
  ],
});

//
// Push a new url onto the nav stack.
//
export const navigationUrlPush = selector({
  key: "navigationDataPush",
  get: ({ get }) => {},
  set: ({ get, set }: any, url: any) => {
    const activeTab = get(navigationActiveTab);
    const navData = get(navigationDataMap(activeTab));
    set(navigationDataMap(activeTab), {
      ...navData,
      urls: [...navData.urls, url],
    });
  },
});

//
// Pop a new url onto the nav stack.
//
export const navigationUrlPop = selector({
  key: "navigationDataPop",
  get: ({ get }) => {},
  set: ({ get, set }: any) => {
    const activeTab = get(navigationActiveTab);
    const navData = get(navigationDataMap(activeTab));
    const urls = [...navData.urls];
    urls.pop();
    set(navigationDataMap(activeTab), {
      ...navData,
      urls,
    });
  },
});

//
// React component to place on the right nav button.
//
export const navigationRightButton = atom<any | null>({
  key: "navigationRightButton",
  default: null,
});

export const navigationLeftButton = atom<any | null>({
  key: "navigationLeftButton",
  default: null,
});

export const navigationStyle = atom<any | null>({
  key: "navigationStyle",
  default: {},
});
