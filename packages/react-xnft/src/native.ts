import { AppRegistry } from "react-native-web";

export function RegisterNativeXnft(
  name: string,
  componentProvider: () => () => JSX.Element
) {
  // hide legacy react-xnft container
  document.getElementById("container")!.style.display = "none";
  document.getElementById("native-container")!.style.display = "flex";

  AppRegistry.registerComponent(name, componentProvider);

  AppRegistry.runApplication(name, {
    rootTag: document.getElementById("native-container"),
  });
}
