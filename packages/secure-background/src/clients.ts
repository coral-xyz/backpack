import type { TransportClient, TransportServer } from "./types";

export const mockTransportServer: TransportServer = {
  setListener: () => () => {},
};
export const mockTransportClient: TransportClient = {
  request: () => Promise.resolve(null as never),
};

export { SVMClient } from "./services/svm/client";
// export { ContentScriptTransportClient } from "./transports/ContentScriptTransportClient";
export { ContentScriptTransportServer } from "./transports/ContentScriptTransportServer";
