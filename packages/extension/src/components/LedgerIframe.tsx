import {
  LEDGER_IFRAME_URL,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
} from "@200ms/common";
import { useEffect, useRef } from "react";

/**
 * A React component that renders an iframe used to communicate with the ledger
 */
const LedgerIframe = () => {
  const iframe = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    let handleMessage: (event: MessageEvent) => void;

    navigator.serviceWorker.ready.then((_registration) => {
      handleMessage = ({ data: { type, detail } }) => {
        if (type !== LEDGER_INJECTED_CHANNEL_RESPONSE) {
          return;
        }
        navigator.serviceWorker.controller?.postMessage(detail);
      };

      window.addEventListener("message", handleMessage);

      navigator.serviceWorker.onmessage = (event) => {
        console.log({
          receivedAndPosting: event.data,
          iframe: iframe.current,
          contentWindow: iframe.current!.contentWindow,
        });
        iframe.current!.contentWindow!.postMessage(event.data, "*");
      };
    });

    return () => {
      // TODO: check if this cleanup is adequate
      navigator.serviceWorker.onmessage = null;
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // allow="hid 'src'" is why this component is necessary, because it allows
  // us to communicate with a ledger using the Human Interface Device API
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
