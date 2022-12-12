import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";

import Options from "./Options";

const LedgerIframe = lazy(() => import("../components/LedgerIframe"));

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <Options />
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("options")
);
