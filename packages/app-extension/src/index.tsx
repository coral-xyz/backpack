import React from "react";
import ReactDOM from "react-dom";
import { openPopupWindow, Features } from "@coral-xyz/common";
import App from "./app/App";
import LedgerIframe from "./components/LedgerIframe";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
    <LedgerIframe />
  </React.StrictMode>,
  document.getElementById("root")
);

document.addEventListener("keypress", function onPress(event) {
  //
  // Pop open the window.
  //
  if (Features.popMode) {
    if (event.key === "g" && event.ctrlKey) {
      openPopupWindow("popup.html");
      window.close();
    }
  }
});
