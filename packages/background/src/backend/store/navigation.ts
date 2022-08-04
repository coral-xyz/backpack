import { LocalStorageDb } from "./db";

const STORE_KEY_NAV = "nav-store7";

/**
 * Persistent model for extension navigation urls.
 */
export type Nav = {
  activeTab: string;
  data: { [navId: string]: NavData };
};

export type NavData = {
  id: string;
  urls: Array<any>;
};

export async function getNav(): Promise<Nav | undefined> {
  return await LocalStorageDb.get(STORE_KEY_NAV);
}

export async function setNav(nav: Nav) {
  await LocalStorageDb.set(STORE_KEY_NAV, nav);
}
