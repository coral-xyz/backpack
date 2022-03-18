import { atom, atomFamily, selectorFamily } from "recoil";
import {
  UI_RPC_METHOD_NAVIGATION_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  NAV_COMPONENT_BALANCES_NETWORK,
  NAV_COMPONENT_TOKEN,
  TAB_BALANCES,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { Network } from "../components/Unlocked/Balances/Network";
import { Token } from "../components/Unlocked/Balances/Token";
import { bootstrapFast } from "./bootstrap";

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
  default: TAB_BALANCES,
  effects: [
    ({ setSelf, onSet }) => {
      setSelf(
        (async () => {
          const background = getBackgroundClient();
          return background.request({
            method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
            params: [],
          });
        })()
      );

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

/**
 * Maps component stringified label to an actual component constructor.
 */
export const navigationComponentMap = selectorFamily({
  key: "navigationStack",
  get:
    (navId: string) =>
    ({ get }) => {
      switch (navId) {
        case NAV_COMPONENT_BALANCES_NETWORK:
          return (props: any) => <Network {...props} />;
        case NAV_COMPONENT_TOKEN:
          return (props: any) => <Token {...props} />;
        default:
          throw new Error("invariant violation");
      }
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

export const navigationBorderBottom = atom<boolean>({
  key: "navigationBorderBottom",
  default: true,
});

export const navigationRightButton = atom<any | null>({
  key: "navigationRightButton",
  default: null,
});
