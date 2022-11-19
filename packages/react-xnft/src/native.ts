import { AppRegistry } from "react-native";

export function RunNativeXnft(appRegistry: typeof AppRegistry) {
  // hide legacy react-xnft container
  document.getElementById("container") &&
    (document.getElementById("container")!.style.display = "none");
  document.getElementById("native-container")!.style.display = "flex";

  appRegistry.runApplication("xNFT", {
    rootTag: document.getElementById("native-container"),
  });
}
