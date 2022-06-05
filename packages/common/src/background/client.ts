import { BackgroundClient } from "../channel";

let _backgroundClient: BackgroundClient | null = null;
let _backgroundResponseClient: BackgroundClient | null = null;

export function setBackgroundClient(c: BackgroundClient) {
  _backgroundClient = c;
}

export function setBackgroundResponseClient(c: BackgroundClient) {
  _backgroundResponseClient = c;
}

export function getBackgroundClient(): BackgroundClient {
  if (_backgroundClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundClient;
}

export function getBackgroundResponseClient(): BackgroundClient {
  if (_backgroundResponseClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundResponseClient;
}
