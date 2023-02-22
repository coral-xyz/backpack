import React, { lazy, Suspense } from "react";
import { render } from "react-dom";

import Options from "./Options";

const LedgerIframe = lazy(() => import("../components/LedgerIframe"));

//
// Render the UI.
//
const container = document.getElementById("options");
render(
  <React.StrictMode>
    <Options />
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>,
  container
);
