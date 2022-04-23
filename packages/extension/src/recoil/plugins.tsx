import { selector } from "recoil";
import * as atoms from "./atoms";

// full path to HTML is currently required, will be fixed in future
const OPEN_ORDERS_PLUGIN_URL = "https://localhost:4444/index.html";
const OPEN_ORDERS_ICON_URL =
  "https://pbs.twimg.com/media/FQuhVHfWQAEHTWM?format=jpg&name=4096x4096";

const COUNTER_PLUGIN_URL = OPEN_ORDERS_PLUGIN_URL;
const COUNTER_ICON_URL =
  "https://pbs.twimg.com/profile_images/1514417507175735301/STVALJof_400x400.jpg";

//
// For now we just provide some default apps.
//
export const plugins = selector({
  key: "plugins",
  get: ({ get }: any) => {
    const activeWallet = get(atoms.activeWallet);
    const connectionUrl = get(atoms.connectionUrl);
    return [
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Open Orders",
        activeWallet,
        connectionUrl,
      },
      {
        url: COUNTER_PLUGIN_URL,
        iconUrl: COUNTER_ICON_URL,
        title: "Open Orders",
        activeWallet,
        connectionUrl,
      },
    ];
  },
});
