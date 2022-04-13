import { atom, atomFamily, selector, selectorFamily } from "recoil";
import {
  UI_RPC_METHOD_NAVIGATION_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  NAV_COMPONENT_BALANCES_NETWORK,
  NAV_COMPONENT_TOKEN,
  NAV_COMPONENT_PLUGINS,
  TAB_BALANCES,
  TAB_BRIDGE,
  TAB_QUEST,
  TAB_FRIENDS,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { Balances } from "./../components/Unlocked/Balances";
import { Quests } from "./../components/Unlocked/Quests";
import { Bridge } from "./../components/Unlocked/Bridge";
import { Settings } from "./../components/Unlocked/Settings";
import { Network } from "../components/Unlocked/Balances/Network";
import { Token } from "../components/Unlocked/Balances/Token";
import { bootstrapFast } from "./bootstrap";
import { Plugins } from "../components/Unlocked/Balances/Plugins";

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

// Returns the root of the navigation stack for a given tab.
export const navigationTabRootRenderer = selectorFamily({
  key: "navigationTabRoot",
  get:
    (tab: string) =>
    ({ get }: any) => {
      return () => {
        return (
          <>
            {tab === TAB_BALANCES && <Balances />}
            {tab === TAB_QUEST && <Quests />}
            {tab === TAB_BRIDGE && <Bridge />}
            {tab === TAB_FRIENDS && <Settings />}
          </>
        );
      };
    },
});

/**
 * Maps component stringified label to an actual component constructor.
 */
export const navigationComponentMap = selectorFamily({
  key: "navigationStack",
  get: (navId: string) => () => {
    switch (navId) {
      case NAV_COMPONENT_BALANCES_NETWORK:
        return (props: any) => <Network {...props} />;
      case NAV_COMPONENT_TOKEN:
        return (props: any) => <Token {...props} />;
      case NAV_COMPONENT_PLUGINS:
        return (props: any) => <Plugins {...props} />;
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
