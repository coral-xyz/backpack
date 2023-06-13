import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BACKPACK_FEATURE_POP_MODE,
  isValidEventOrigin,
  openPopupWindow,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SECURE_SVM_SAY_HELLO,
  SECURE_UI_EVENTS,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-client";
import {
  FromExtensionTransportSender,
  ToSecureUITransportReceiver,
  UserClient,
} from "@coral-xyz/secure-client";
import { v4 } from "uuid";

import "./index.css";

const App = lazy(() => import("./app/App"));
const LedgerIframe = lazy(() => import("./components/LedgerIframe"));

// Tell all existing extension instances that this instance now exists.
// This block ensures a single extension window is open at any given time.
chrome.runtime
  .sendMessage("new-instance-was-opened")
  .then(() => {
    // Close all existing extension instances so only the newest is running
    chrome.runtime.onMessage.addListener((msg, sender) => {
      if (isValidEventOrigin(sender) && msg === "new-instance-was-opened") {
        window.close();
      }
    });
  })
  .catch(console.error);

// Send connect event to background script to open channel.
// add unique name so background can identify the popup.
const urlParams = new URLSearchParams(window.location.search);
const windowId = urlParams.get("windowId") ?? v4();
const port = chrome.runtime.connect({ name: windowId });

const secureUITransportReceiver =
  new ToSecureUITransportReceiver<SECURE_UI_EVENTS>(port);
const extensionTransportSender =
  new FromExtensionTransportSender<SECURE_EVENTS>();

const user = new UserClient(extensionTransportSender);

secureUITransportReceiver.setHandler(async (request) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await user.unlockKeyring({
    uuid: "uuid",
    password: "password",
  });
  console.log("PCA unlock response", response);
  return {
    ...request,
    request: undefined,
    response: { approved: true },
  };
});
//
// Configure event listeners.
//
document.addEventListener("keydown", async function onKeyDown(event) {
  //
  // Pop open the window.
  //
  if (BACKPACK_FEATURE_POP_MODE) {
    if (event.key === "g" && event.ctrlKey) {
      event.preventDefault();
      const currentWindow = await chrome.windows.getCurrent();
      const popupWindow = await openPopupWindow("popup.html");
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
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Suspense fallback={null}>
      <SecureUI
        sender={extensionTransportSender}
        receiver={secureUITransportReceiver}
      />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </>
);

function SecureUI({
  receiver,
  sender,
}: {
  receiver: TransportReceiver<SECURE_UI_EVENTS>;
  sender: TransportSender<SECURE_EVENTS>;
}) {
  receiver;
  sender;
  return null;
}
