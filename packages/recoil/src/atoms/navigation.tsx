import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { getBackgroundClient } from "../background";
import { bootstrapFast } from "../atoms";
import {
  UI_RPC_METHOD_NAVIGATION_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
} from "@200ms/common";

/**
 * Effective view model for each tab's navigation controller.
 */
export const navigation = atom({
  key: "navigation",
  default: "balances",
  effects: [
    ({ onSet }) => {
      onSet((cluster) => {
        // TODO: do we want to handle this via notification instead?
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
            params: [cluster],
          })
          .catch(console.error);
      });
    },
  ],
});

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
        return tabs.filter((t) => t.id === navKey)[0];
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

export const navigationBorderBottom = atom<boolean>({
  key: "navigationBorderBottom",
  default: true,
});

export const navigationRightButton = atom<any | null>({
  key: "navigationRightButton",
  default: null,
});

// Returns the root of the navigation stack for a given tab.
export const navigationTabRootRenderer = selectorFamily({
  key: "navigationTabRoot",
  get:
    (tab: string) =>
    ({ get }: any) => {
      return _TAB_COMPONENTS!(tab);
    },
});

/**
 * Returns the function to render the component on the given navigation stack.
 */
export const navigationRenderer = selectorFamily({
  key: "navigationRenderer",
  get:
    (navKey: string) =>
    ({ get }) => {
      const navData = get(navigationDataMap(navKey));
      const componentStr =
        navData.components.length > 0
          ? navData.components[navData.components.length - 1]
          : undefined;
      const props =
        navData.props.length > 0
          ? navData.props[navData.props.length - 1]
          : undefined;
      if (!componentStr) {
        return undefined;
      }
      return () => get(navigationComponentMap(componentStr))(props);
    },
});

/**
 * Maps component stringified label to an actual component constructor.
 */
export const navigationComponentMap = selectorFamily({
  key: "navigationStack",
  get: (navId: string) => () => {
    return _NAVIGATION_MAP!(navId);
  },
});

////////////////////////////////////////////////////////////////////////////////
//
// Below is boilerplate that must be invoked by the extension immediately on
// setup. A bit of a hack, but this allows us to remove recoil as a depdendency
// from the extension ui.
//
////////////////////////////////////////////////////////////////////////////////

let _NAVIGATION_MAP: Function | null = null;
let _TAB_COMPONENTS: Function | null = null;
export function setupNavigationMap(fn: Function) {
  _NAVIGATION_MAP = fn;
}
export function setupTabComponents(components: Function) {
  _TAB_COMPONENTS = components;
}
