import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { EXTENSION_HEIGHT, EXTENSION_WIDTH } from "@coral-xyz/common";
import { Backpack } from "@coral-xyz/react-common";
import {
  FromExtensionTransportSender,
  NotificationExtensionBroadcastListener,
  ToSecureUITransportReceiver,
} from "@coral-xyz/secure-clients";
import type { SECURE_EVENTS } from "@coral-xyz/secure-clients/types";
import SecureUI from "@coral-xyz/secure-ui";
import { v4 } from "uuid";

import { OptClickToComponent } from "../utils/click-to-component";

// Code-splitting keeps the options.js bundle under 4MB which is
// a requirement for Firefox extensions
const Options = lazy(() => import("./Options"));
// const LedgerIframe = lazy(() => import("../components/LedgerIframe"));

const urlParams = new URLSearchParams(window.location.search);
const requestWindowId = urlParams.get("windowId");
// if popup was passed windowId it was opened by secure-background
// and should not render app since secure-ui will handle the request.
const windowId = requestWindowId ?? v4();

const extensionTransportSender =
  new FromExtensionTransportSender<SECURE_EVENTS>({
    origin: {
      name: "Backpack Extension Options",
      address: window.location.origin,
      context: "extension",
    },
  });
const notificationBroadcastListener =
  new NotificationExtensionBroadcastListener();

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

// Render the UI.
// TOOD(react) createRoot is required: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById("options");
const root = createRoot(container!);

root.render(
  <>
    <OptClickToComponent />
    <Suspense fallback={null}>
      <Options
        transportSender={extensionTransportSender}
        notificationListener={notificationBroadcastListener}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: `${EXTENSION_WIDTH}px`,
            height: `${EXTENSION_HEIGHT}px`,
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <SecureUI
            presentation="modal-relative"
            secureBackgroundSender={secureUITransportSender}
            secureUIReceiver={secureUITransportReceiver}
            notificationListener={notificationBroadcastListener}
          />
        </div>
      </div>
    </Suspense>
    {/* <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense> */}
  </>
);
