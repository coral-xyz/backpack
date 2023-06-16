import type { SECURE_EVENTS } from "../types/events";
import type { TransportReceiver } from "../types/transports";

export function combineTransportReceivers<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
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
