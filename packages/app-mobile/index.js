import { registerRootComponent } from "expo";
import "./src/crypto-shim";

if (typeof Buffer === "undefined") {
  global.Buffer = require("buffer/").Buffer;
}

if (typeof BigInt === "undefined") {
  global.BigInt = require("big-integer");
}

// eslint-disable-next-line
import "react-native-url-polyfill/auto";
// Import the the ethers shims (**BEFORE** ethers)
// eslint-disable-next-line
import "@ethersproject/shims";
// eslint-disable-next-line
import "react-native-gesture-handler";

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
