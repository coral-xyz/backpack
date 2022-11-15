import App from "./App";
import { AppRegistry } from "react-native";

// hide legacy react-xnft container
document.getElementById("container")!.style.display = "none";
document.getElementById("native-container")!.style.display = "flex";

AppRegistry.registerComponent("App", () => App);

AppRegistry.runApplication("App", {
  rootTag: document.getElementById("native-container"),
});
