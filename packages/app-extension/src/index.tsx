import React from "react";
import ReactDOM from "react-dom";
import { openPopupWindow } from "@coral-xyz/common";
import * as cmn from "@coral-xyz/common";
import * as cmnPublic from "@coral-xyz/common-public";
import App from "./app/App";
import LedgerIframe from "./components/LedgerIframe";
import { privateConfig, publicConfig } from "./generated-config";
import "./index.css";

//
// Configure the build.
//
cmn.setConfig(privateConfig);
cmnPublic.setConfigPublic(publicConfig);

//
// Configure event listeners.
//
document.addEventListener("keypress", function onPress(event) {
  //
  // Pop open the window.
  //
  if (cmn.CONFIG.BACKPACK_FEATURE_POP_MODE) {
    if (event.key === "g" && event.ctrlKey) {
      openPopupWindow("popup.html");
      window.close();
    }
  }
});

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <App />
    <LedgerIframe />
  </React.StrictMode>,
  document.getElementById("root")
);
