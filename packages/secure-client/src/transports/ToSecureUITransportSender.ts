import {
  CHANNEL_SECURE_UI_REQUEST,
  CHANNEL_SECURE_UI_RESPONSE,
  openPopupWindow,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  TransportSender,
} from "@coral-xyz/secure-background/clients";
import { v4 } from "uuid";

type QueuedRequest = {
  request: SecureRequest;
  resolve: (resonse: SecureResponse) => void;
  reject: (error: any) => void;
};

export class ToSecureUITransportSender implements TransportSender {
  private port: chrome.runtime.Port | null = null;
  private requestQueue: QueuedRequest[] = [];
  private responseQueue: QueuedRequest[] = [];
  private lastOpenedWindowId: string | null = null;

  constructor() {
    chrome.runtime.onConnect.addListener((port) => {
      console.log("PCA", "connect", port.name);

      // if we are still connected to a plugin -> disconnect.
      if (this.port) {
        this.disconnectPlugin(this.port);
      }

      // set port
      this.port = port;

      // setup message listener
      const messageListner = this.responseHandler.bind(this);
      port.onMessage.addListener(messageListner);

      // send queued requests
      this.sendRequests();

      // listen to disconnect
      const disconnectListener = this.disconnectPlugin.bind(this);
      port.onDisconnect.addListener(disconnectListener);
    });
  }

  private disconnectPlugin = (port: chrome.runtime.Port) => {
    // It's possible that a plugin is closed because a new one opened.
    // We only handle the disconnect if the port is currently connected.
    if (this.port?.name !== port.name) {
      return;
    }
    console.log("PCA", "disconnect", port.name);

    // remove listeners & reference
    port.disconnect();
    this.port = null;

    // reject all waiting responses
    this.responseQueue.forEach((response) => response.reject("Plugin Closed"));
    this.responseQueue = [];
  };

  public send = <T extends SECURE_EVENTS>(request: SecureRequest<T>) => {
    return new Promise<SecureResponse<T>>(
      (resolve: (response: SecureResponse<T>) => void, reject) => {
        const requestWithId = { ...request, id: v4() };
        console.log("PCA request sent", requestWithId);

        this.requestQueue.push({
          request: requestWithId,
          resolve,
          reject,
        });
        this.sendRequests();
      }
    );
  };

  public responseHandler = (response) => {
    if (response.channel !== CHANNEL_SECURE_UI_RESPONSE) {
      return;
    }

    // find waiting request in responseQueue
    const index = this.responseQueue.findIndex(
      (queuedResponse) => queuedResponse.request.id === response.data?.id
    );
    console.log("PCA response received", response, index);

    if (index < 0) {
      return;
    }

    // remove request from queue
    const queuedRequest = this.responseQueue[index];
    this.responseQueue.splice(index, 1);

    // if we're not waiting for any more responses
    // and this is the popup we originally opened
    // -> close the popup.
    if (
      this.responseQueue.length <= 0 &&
      this.port?.name === this.lastOpenedWindowId &&
      this.port.sender?.tab?.windowId
    ) {
      chrome.windows.remove(this.port.sender?.tab?.windowId).catch((e) => {
        console.error(e);
      });
    }

    // resolve request
    if (response.data.error) {
      queuedRequest.reject(response.data);
    } else {
      queuedRequest.resolve(response.data);
    }
  };

  private sendRequests = () => {
    // open popup if we dont have one.
    if (!this.port) {
      return this.openPopup(v4());
    }

    // send all pending requests
    this.port.postMessage({
      channel: CHANNEL_SECURE_UI_REQUEST,
      data: this.requestQueue.map((queued) => queued.request),
    });

    // move requests to responseQueue to wait for response.
    this.responseQueue.push(...this.requestQueue);
    this.requestQueue = [];

    // Focus window to bring it to front.
    // Since port comes from onConnect, tab/window information is available.
    if (this.port.sender?.tab?.windowId) {
      chrome.windows
        .update(this.port.sender?.tab?.windowId, {
          focused: true,
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  private openPopup = (windowId: string) => {
    this.lastOpenedWindowId = windowId;
    openPopupWindow("popup.html?windowId=" + windowId).catch((e) => {
      console.error(e);
    });
  };
}
