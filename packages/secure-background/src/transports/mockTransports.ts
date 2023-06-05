import type { TransportReceiver, TransportSender } from "../types/transports";

export const mockTransportReceiver: TransportReceiver = {
  setHandler: () => () => {},
};
export const mockTransportSender: TransportSender = {
  send: () => Promise.resolve(null as never),
};
