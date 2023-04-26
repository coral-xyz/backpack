import { TextEncoder, TextDecoder } from "fast-text-encoding";
import { registerRootComponent } from "expo";
import "./src/crypto-shim";
// import setGlobalVars from "indexeddbshim/dist/indexeddbshim-noninvasive";

if (typeof Buffer === "undefined") {
  global.Buffer = require("buffer/").Buffer;
}

if (typeof BigInt === "undefined") {
  global.BigInt = require("big-integer");
}

// https://github.com/expo/browser-polyfill
global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

// setGlobalVars(window, { checkOrigin: false, win: SQLite });

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
