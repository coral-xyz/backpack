interface CustomWindow extends Window {
  ___fromApp: (data: any) => void;
  ___toApp: (data: any) => void;
  ReactNativeWebView: {
    postMessage: (data: string) => void;
  };
}

// order is significant, this should be before the imports
const _window = window as unknown as CustomWindow;
_window.___toApp = (data) => {
  _window.ReactNativeWebView.postMessage(JSON.stringify(data));
};

import {
  BACKGROUND_SERVICE_WORKER_READY,
  EVENT_EMITTER,
} from "@coral-xyz/common";
import { MOBILE_APP_TRANSPORT_RECEIVER_EVENTS } from "@coral-xyz/secure-background/src/transports/FromMobileAppTransportReceiver";
import { MOBILE_APP_SECUREUI_SENDER_EVENTS } from "@coral-xyz/secure-background/src/transports/ToMobileAppSecureUITransportSender";

import { start } from ".";

_window.___fromApp = (data) => {
  EVENT_EMITTER.emit("from-app", data);
  MOBILE_APP_TRANSPORT_RECEIVER_EVENTS.emit("message", data);
  MOBILE_APP_SECUREUI_SENDER_EVENTS.emit("message", data);
};

// This code runs inside a hidden webview on mobile but will be
// isMobile: false for now while setting up secure ui
start({ isMobile: false });

_window.___toApp({ type: BACKGROUND_SERVICE_WORKER_READY });
