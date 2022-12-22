import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { BACKPACK_FEATURE_POP_MODE, openPopupWindow } from "@coral-xyz/common";

import "./index.css";

const App = lazy(() => import("./app/App"));
const LedgerIframe = lazy(() => import("./components/LedgerIframe"));

// Connect to the background script so it can detect if the popup is closed
chrome.runtime.connect();

//
// Configure event listeners.
//
document.addEventListener("keypress", async function onPress(event) {
  //
  // Pop open the window.
  //
  if (BACKPACK_FEATURE_POP_MODE) {
    if (event.key === "g" && event.ctrlKey) {
      await openPopupWindow("popup.html");
      window.close();
    }
  }
});

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
