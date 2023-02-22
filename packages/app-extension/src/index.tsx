import React, { lazy, Suspense } from "react";
import { render } from "react-dom";
import { openPopupWindow } from "@coral-xyz/common/dist/esm/browser";
import { BACKPACK_FEATURE_POP_MODE } from "@coral-xyz/common/dist/esm/generated-config";

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
      const currentWindow = await chrome.windows.getCurrent();
      const popupWindow = await openPopupWindow("popup.html");
      if (currentWindow.id !== popupWindow.id) {
        window.close();
      }
    }
  }
});

//
// Render the UI. TOOD(react) createRoot is required to support v18 version
//
const container = document.getElementById("root");
render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>,
  container
);
