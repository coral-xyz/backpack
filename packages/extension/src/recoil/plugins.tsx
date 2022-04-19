import { selector } from "recoil";
import * as atoms from "./atoms";

const EXAMPLE_PLUGIN_URL = "https://localhost:4444";

export const plugins = selector({
  key: "plugins",
  get: ({ get }: any) => {
    const activeWallet = get(atoms.activeWallet);
    const connectionUrl = get(atoms.connectionUrl);
    return [{ url: EXAMPLE_PLUGIN_URL, activeWallet, connectionUrl }];
  },
});
