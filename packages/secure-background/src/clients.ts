import type { TransportReceiver, TransportSender } from "./types";

export const mockTransportReceiver: TransportReceiver = {
  setHandler: () => () => {},
};
export const mockTransportSender: TransportSender = {
  send: () => Promise.resolve(null as never),
};

export { SVMClient } from "./services/svm/client";
export { ContentScriptTransportReceiver } from "./transports/ContentScriptTransportReceiver";
export { ContentScriptTransportSender } from "./transports/ContentScriptTransportSender";
export { SecureUITransportReceiver } from "./transports/SecureUITransportReceiver";
export { SecureUITransportSender } from "./transports/SecureUITransportSender";
