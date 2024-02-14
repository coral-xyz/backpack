import { TAB_RECENT_ACTIVITY } from "@coral-xyz/common";
import { PersistentStorageKeys } from "@coral-xyz/secure-clients";

import { LocalStorageDb } from "./db";


/**
 * Persistent model for extension navigation urls.
 */
export type Nav = {
  activeTab: string;
  data: { [navId: string]: NavData };
};

type NavData = {
  id: string;
  urls: Array<any>;
  // If set, the tab is a reference to another tab (e.g., balances which
  // is broken up into three: tokens, collectibles, and recent activity.
  // This is a total hack to avoid rewriting the navigation.
  ref?: any;
};

export async function getNav(): Promise<Nav | undefined> {
  const nav = await LocalStorageDb.get<Nav>(PersistentStorageKeys.STORE_KEY_NAV);

  if (!nav) {
    return nav;
  }

  let needsMigration = false;

  if (nav[TAB_RECENT_ACTIVITY] === undefined) {
    needsMigration = true;
    nav[TAB_RECENT_ACTIVITY] = {
      id: TAB_RECENT_ACTIVITY,
      urls: [],
    };
  }

  if (needsMigration) {
    await setNav(nav);
  }

  return nav;
}

export async function setNav(nav: Nav) {
  await LocalStorageDb.set(PersistentStorageKeys.STORE_KEY_NAV, nav);
}
