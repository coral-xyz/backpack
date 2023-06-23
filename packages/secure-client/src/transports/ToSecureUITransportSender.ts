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
} from "@coral-xyz/secure-background/types";
import { v4 } from "uuid";

type QueuedRequest<
  X extends SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = {
  request: SecureRequest;
  resolve: (resonse: SecureResponse<X, R>) => void;
};

export class ToSecureUITransportSender<
  X extends SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportSender<X, R>
{
  private port: chrome.runtime.Port | null = null;
  private requestQueue: QueuedRequest<X, R>[] = [];
  private responseQueue: QueuedRequest<X, R>[] = [];
  private lastOpenedWindowId: string | null = null;
  private maybeClosePopupTimeout: any;

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
    try {
      port.disconnect();
    } catch (e) {
      /* this is okay to fail, as it means no listeners left. */
      console.error(e);
    }
    this.port = null;

    // resolve all waiting responses with error
    this.responseQueue.forEach((response) =>
      response.resolve({
        name: response.request.name,
        error: "Plugin Closed",
      } as SecureResponse<X, R>)
    );
    this.responseQueue = [];
  };

  public send = <C extends R = R, T extends X = X>(
    request: SecureRequest<T>
  ) => {
    // new request -> we wont need to close popup.
    clearTimeout(this.maybeClosePopupTimeout);

    return new Promise<SecureResponse<T, C>>(
      (resolve: (response: SecureResponse<T, C>) => void) => {
        const requestWithId = { ...request, id: v4() };
        console.log("PCA request to secure UI sent", requestWithId);

        this.requestQueue.push({
          request: requestWithId,
          resolve,
        });
        this.sendRequests();
      }
    );
  };

  private responseHandler = (response) => {
    if (response.channel !== CHANNEL_SECURE_UI_RESPONSE) {
      return;
    }

    // find waiting request in responseQueue
    const index = this.responseQueue.findIndex(
      (queuedResponse) => queuedResponse.request.id === response.data?.id
    );
    console.log("PCA response from secure UI received", response, index);

    if (index < 0) {
      return;
    }

    // remove request from queue
    const queuedRequest = this.responseQueue[index];
    this.responseQueue.splice(index, 1);

    // resolve request
    queuedRequest.resolve(response.data);

    // if we could close popup
    // -> wait for followup prompts (ie Ledger signing)
    // -> then maybe close popup
    if (this.isPopupClosable()) {
      this.maybeClosePopupTimeout = setTimeout(
        this.maybeClosePopup.bind(this),
        300
      );
    }
  };

  private isPopupClosable = () => {
    // if we're not waiting for any more responses
    // and this is the popup we originally opened
    // -> we can close popup.
    return (
      this.responseQueue.length <= 0 &&
      this.requestQueue.length <= 0 &&
      this.port?.name === this.lastOpenedWindowId
    );
  };

  private maybeClosePopup() {
    // if we can close popup
    // -> close the popup.
    if (this.isPopupClosable() && this.port?.sender?.tab?.windowId) {
      chrome.windows.remove(this.port.sender.tab.windowId).catch((e) => {
        console.error(e);
      });
    }
  }

  private sendRequests = () => {
    // open popup if we dont have one.
    if (!this.port) {
      this.openPopup(v4());
      return;
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
