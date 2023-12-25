const startTime = Date.now();

import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BACKPACK_FEATURE_POP_MODE, openPopupWindow } from "@coral-xyz/common";
import {
  FromExtensionTransportSender,
  NotificationExtensionBroadcastListener,
  ToSecureUITransportReceiver,
} from "@coral-xyz/secure-clients";
import type { SECURE_EVENTS } from "@coral-xyz/secure-clients/types";
import SecureUI from "@coral-xyz/secure-ui";
import { v4 } from "uuid";

import { OptClickToComponent } from "./utils/click-to-component";

import "./index.css";

const App = lazy(() => import("./app/App"));
// const LedgerIframe = lazy(() => import("./components/LedgerIframe"));

const urlParams = new URLSearchParams(window.location.search);
const requestWindowId = urlParams.get("windowId");
// if popup was passed windowId it was opened by secure-background
// and should not render app since secure-ui will handle the request.
const shouldRenderApp = !requestWindowId;
const windowId = requestWindowId ?? v4();

const extensionTransportSender =
  new FromExtensionTransportSender<SECURE_EVENTS>({
    origin: {
      name: "Backpack Extension",
      address: "https://backpack.app",
      context: "extension",
    },
  });

const secureUITransportReceiver = new ToSecureUITransportReceiver<
  SECURE_EVENTS,
  "ui"
>(windowId);

const secureUITransportSender = new FromExtensionTransportSender<SECURE_EVENTS>(
  {
    origin: {
      name: "Backpack Extension",
      address: "https://backpack.app",
      context: "secureUI",
    },
  }
);

const notificationBroadcastListener =
  new NotificationExtensionBroadcastListener();

//
// Configure event listeners.
//
document.addEventListener("keydown", async function onKeyDown(event) {
  // Ctrl+Cmd+G opens wallet in a new tab in development mode.
  if (
    process.env.NODE_ENV === "development" &&
    event.key === "g" &&
    event.ctrlKey &&
    event.metaKey
  ) {
    event.preventDefault();
    window.open(window.location.href);
  }
  //
  // Pop open the window with Ctrl+G when pop mode is enabled.
  //
  else if (BACKPACK_FEATURE_POP_MODE) {
    if (event.key === "g" && event.ctrlKey) {
      event.preventDefault();
      const popupWindow = await openPopupWindow("popup.html");
      const currentWindow = await globalThis.chrome?.windows.getCurrent();
      if (currentWindow.id !== popupWindow.id) {
        window.close();
      }
    }
  }
});

// Render the UI.
// TOOD(react) createRoot is required: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <>
    <OptClickToComponent />
    <Suspense fallback={null}>
      <SecureUI
        timing={startTime}
        secureBackgroundSender={secureUITransportSender}
        secureUIReceiver={secureUITransportReceiver}
        notificationListener={notificationBroadcastListener}
      >
        {shouldRenderApp ? (
          <App
            notificationListener={notificationBroadcastListener}
            secureBackgroundSender={extensionTransportSender}
          />
        ) : null}
      </SecureUI>
    </Suspense>
    {/* <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense> */}
  </>
);
