import { PortChannelClient } from "../common";

let _backgroundClient: PortChannelClient | null = null;
let _backgroundResponseClient: PortChannelClient | null = null;

export function setBackgroundClient(c: PortChannelClient) {
  _backgroundClient = c;
}

export function setBackgroundResponseClient(c: PortChannelClient) {
  _backgroundResponseClient = c;
}

export function getBackgroundClient(): PortChannelClient {
  if (_backgroundClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundClient;
}

export function getBackgroundResponseClient(): PortChannelClient {
  if (_backgroundResponseClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundResponseClient;
}
