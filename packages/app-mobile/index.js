import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";

if (typeof Buffer === "undefined") {
  global.Buffer = require("buffer/").Buffer;
}

Promise.allSettled =
  Promise.allSettled ||
  ((promises) =>
    Promise.all(
      promises.map((p) =>
        p
          .then((value) => ({
            status: "fulfilled",
            value,
          }))
          .catch((reason) => ({
            status: "rejected",
            reason,
          }))
      )
    ));

import { App } from "./src/App"; // eslint-disable-line
registerRootComponent(App);
