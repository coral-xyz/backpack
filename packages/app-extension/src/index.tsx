import React from "react";
import ReactDOM from "react-dom";
import { openPopupWindow, BACKPACK_FEATURE_POP_MODE } from "@coral-xyz/common";
import App from "./app/App";
import LedgerIframe from "./components/LedgerIframe";
import "./index.css";

//
// Configure event listeners.
//
document.addEventListener("keypress", function onPress(event) {
  //
  // Pop open the window.
  //
  if (BACKPACK_FEATURE_POP_MODE) {
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
