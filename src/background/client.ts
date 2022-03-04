import { PortChannelClient } from "../common";

let _backgroundClient: PortChannelClient | null = null;

export function setBackgroundClient(backgroundClient: PortChannelClient) {
  _backgroundClient = backgroundClient;
}

export function getBackgroundClient(): PortChannelClient {
  if (_backgroundClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundClient;
}
