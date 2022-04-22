import { selector } from "recoil";
import * as atoms from "./atoms";

// full path to HTML is currently required, will be fixed in future
const EXAMPLE_PLUGIN_URL = "https://localhost:4444/index.html";

export const plugins = selector({
  key: "plugins",
  get: ({ get }: any) => {
    const activeWallet = get(atoms.activeWallet);
    const connectionUrl = get(atoms.connectionUrl);
    return [{ url: EXAMPLE_PLUGIN_URL, activeWallet, connectionUrl }];
  },
});
