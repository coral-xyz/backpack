import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

// Code-splitting keeps the options.js bundle under 4MB which is
// a requirement for Firefox extensions
const Options = lazy(() => import("./Options"));
const LedgerIframe = lazy(() => import("../components/LedgerIframe"));

// Render the UI.
// TOOD(react) createRoot is required: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById("options");
const root = createRoot(container!);

root.render(
  <>
    <Suspense fallback={null}>
      <Options />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </>
);
