import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

import Options from "./Options";

const LedgerIframe = lazy(() => import("../components/LedgerIframe"));

//
// Render the UI.
//
const container = document.getElementById("options");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Options />
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </React.StrictMode>
);
