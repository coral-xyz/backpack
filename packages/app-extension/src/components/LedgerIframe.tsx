import {
  getLogger,
  LEDGER_IFRAME_URL,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
} from "@coral-xyz/common";
import { useEffect, useRef } from "react";

const logger = getLogger("app-extension/ledger-iframe");

/**
 * A hidden iframe that's used to communicate (as a proxy) with a Ledger
 */
const LedgerIframe = () => {
  const iframe = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    let handleMessage: (event: MessageEvent) => void;

    navigator.serviceWorker.ready.then((_registration) => {
      //
      // Response: relays message from the injected ledger iframe to the
      //           background script.
      //
      handleMessage = ({ data }) => {
        if (data.type !== LEDGER_INJECTED_CHANNEL_RESPONSE) {
          return;
        }
        logger.debug("handleMessage", data);
        navigator.serviceWorker.controller?.postMessage(data);
      };
      window.addEventListener("message", handleMessage);

      //
      // Request: relays the message from the background script to the
      //          iframe so that it has permissions to communicate with
      //          the ledger.
      navigator.serviceWorker.onmessage = ({ data }) => {
        logger.debug("onmessage", data);
        iframe.current?.contentWindow?.postMessage(data, "*");
      };
    });

    return () => {
      // TODO: check if this cleanup is adequate
      navigator.serviceWorker.onmessage = null;
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  logger.debug("rendering hidden iframe for ledger");

  // allow="hid 'src'" is why this component is necessary, because it allows
  // us to communicate with a ledger using the Human Interface Device API.
  return (
    <iframe
      ref={iframe}
      src={LEDGER_IFRAME_URL}
      allow="hid 'src'"
      tabIndex={-1}
      style={{ display: "none" }}
    />
  );
};

export default LedgerIframe;
