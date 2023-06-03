import type { SECURE_EVENTS } from "../events";
import type { TransportReceiver } from "../types";

export function combineTransportReceivers<
  T extends SECURE_EVENTS = SECURE_EVENTS
>(...servers: TransportReceiver<T>[]): TransportReceiver<T> {
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
