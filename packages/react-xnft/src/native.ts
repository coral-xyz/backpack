import type { AppRegistry } from "react-native";

export function RunNativeXnft(appRegistry: typeof AppRegistry) {
  appRegistry.runApplication("xNFT", {
    rootTag: document.getElementById("container"),
  });
}
