import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";

const LedgerIframe = lazy(() => import("../components/LedgerIframe"));
const Options = lazy(() => import("./Options"));

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <Options />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("options")
);
