import type { SECURE_EVENTS } from "../events";
import type { SecureRequestType, TransportReceiver } from "../types/transports";

export function combineTransportReceivers<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
>(...servers: TransportReceiver<T, R>[]): TransportReceiver<T, R> {
  return {
    setHandler: (listener) => {
      const removeListeners = servers.map((server) =>
        server.setHandler(listener)
      );
      return () => {
        removeListeners.forEach((removeListener) => removeListener());
      };
    },
  };
}
