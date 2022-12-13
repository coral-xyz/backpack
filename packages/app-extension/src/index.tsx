import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { BACKPACK_FEATURE_POP_MODE, openPopupWindow } from "@coral-xyz/common";

import "./index.css";

const App = lazy(() => import("./app/App"));
const LedgerIframe = lazy(() => import("./components/LedgerIframe"));

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
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
