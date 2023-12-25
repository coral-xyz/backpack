import {
  CHANNEL_SECURE_UI_REQUEST,
  CHANNEL_SECURE_UI_RESPONSE,
  getLogger,
  openPopupWindow,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEventOrigin,
  SecureRequest,
  SecureRequestType,
  SecureResponse,
  TransportQueuedRequest,
  TransportSend,
  TransportSender,
  TransportSendRequest,
} from "@coral-xyz/secure-background/types";
import { v4 } from "uuid";

const logger = getLogger("secure-ui ToSecureUITransportSender");

// Forwarder does not set its own origin and instead expects a origin to exist on the request.
export class ToSecureUITransportSender<
  X extends SECURE_EVENTS,
  R extends SecureRequestType = undefined
> implements TransportSender<X, R>
{
  private port: chrome.runtime.Port | null = null;
  private requestQueue: (TransportQueuedRequest<X, R> & {
    portName?: string;
  })[] = [];
  private responseQueue: (TransportQueuedRequest<X, R> & {
    portName: string;
  })[] = [];
  private lastOpenedWindowId: string | null = null;
  private maybeClosePopupTimeout: any;
  private origin: SecureEventOrigin;
  private forwardOrigin: boolean;

  constructor(init: { origin: SecureEventOrigin; forwardOrigin?: boolean }) {
    this.origin = init.origin;
    this.forwardOrigin = !!init.forwardOrigin;

    globalThis.chrome?.runtime?.onConnect.addListener((port) => {
      logger.debug("Plugin Connected", port.name);

      // if we are still connected to a differnt plugin disconnect it
      if (this.port && this.port?.name !== port.name) {
        this.disconnectPlugin(this.port);
      }

      // set port
      this.port = port;

      // setup message listener
      const messageListner = this.responseHandler.bind(this);
      port.onMessage.addListener(messageListner);

      // move pending responses to port.name from responseQueue to requestQueue
      this.requestQueue.push(
        ...this.responseQueue.filter(
          (response) => response.portName === port.name
        )
      );
      this.responseQueue = this.responseQueue.filter(
        (response) => response.portName !== port.name
      );

      // give plugin a bit to setup listeners then send queued requests
      setTimeout(() => this.sendRequests(), 100); // 100 is the reliable minium

      // listen to disconnect
      const disconnectListener = this.maybeDisconnectPlugin.bind(this);
      port.onDisconnect.addListener(disconnectListener);
    });
  }

  private maybeDisconnectPlugin = async (port: chrome.runtime.Port) => {
    // It's possible that a plugin is closed because a new one opened.
    // We only handle the disconnect if the port is currently connected.
    if (this.port?.name !== port.name) {
      return;
    }
    this.port = null;

    // wait to see if port is immediately reconnecting
    const newPort = await new Promise<chrome.runtime.Port | null>(
      (resolve) => setTimeout(() => resolve(this.port), 500) // 500 is the reliable minium
    );
    // if same port has reconnected (reload)
    if (newPort?.name === port.name) {
      return; //-> dont send error responses
    }

    this.disconnectPlugin(port);
  };
  private disconnectPlugin = (port: chrome.runtime.Port) => {
    logger.debug("Plugin Disconnected", port.name);

    // remove listeners & reference
    try {
      port.disconnect();
    } catch (e) {
      /* this is okay to fail, as it means no listeners left. */
      logger.error("Plugin Disconnect", e);
    }

    // resolve all waiting responses for this port with error
    this.responseQueue
      .filter((response) => response.portName === port.name)
      .forEach((response) => {
        const responseWithId = {
          name: response.request.name,
          id: response.request.id,
          error: {
            message: "Plugin Closed",
          },
        } as SecureResponse<X, R>;

        logger.debug("Response", responseWithId);
        response.resolve(responseWithId);
      });

    // remove waiting responses for this port form queue
    this.responseQueue = this.responseQueue.filter(
      (response) => response.portName !== port.name
    );
  };

  public send: TransportSend<X, R> = <T extends X = X, C extends R = R>(
    request: TransportSendRequest<T, C>
  ) => {
    // new request -> we wont need to close popup.
    clearTimeout(this.maybeClosePopupTimeout);

    return new Promise<SecureResponse<T, C>>(
      (resolve: (response: SecureResponse<T, C>) => void) => {
        // origin is not overwritten here
        const requestWithId = {
          ...request,
          origin: !this.forwardOrigin
            ? this.origin
            : request.origin ?? this.origin,
          id: v4(),
        } as SecureRequest<T, C>;

        this.requestQueue.push({
          request: requestWithId,
          resolve,
          // this is safe to cast because constraint: <T extends X = X, C extends R = R>
        } as unknown as TransportQueuedRequest<X, R>);

        this.sendRequests();
      }
    );
  };

  private responseHandler = (response: {
    channel: string;
    data: SecureResponse<X, R>;
  }) => {
    if (response.channel !== CHANNEL_SECURE_UI_RESPONSE) {
      return;
    }

    // find waiting request in responseQueue
    const index = this.responseQueue.findIndex(
      (queuedResponse) => queuedResponse.request.id === response.data?.id
    );

    if (index < 0) {
      return;
    }

    // remove request from queue
    const queuedRequest = this.responseQueue[index];
    this.responseQueue.splice(index, 1);

    logger.debug("Response", response.data);

    // resolve request
    if (queuedRequest) {
      queuedRequest.resolve(response.data);
    } else {
      logger.error("No queued request found.", response.data);
    }

    // if we could close popup currently
    // -> wait for followup prompts (ie Ledger signing)
    // -> then maybe close popup
    if (this.isPopupClosable()) {
      this.maybeClosePopupTimeout = setTimeout(
        this.maybeClosePopup.bind(this),
        10 // 10 is the reliable minium
      );
    }
  };

  private isPopupClosable = () => {
    // if we're not waiting for any more responses
    // and this is the popup we originally opened
    // -> we can close popup.
    return (
      this.responseQueue.filter(
        (response) => response.portName === this.port?.name
      ).length <= 0 &&
      this.requestQueue.length <= 0 &&
      this.port?.name === this.lastOpenedWindowId
    );
  };

  private maybeClosePopup() {
    // if we can close popup
    // -> close the popup.
    if (this.isPopupClosable() && this.port?.sender?.tab?.windowId) {
      const name = this.port.name;
      logger.debug("Plugin Close", name);
      globalThis.chrome?.windows
        .remove(this.port.sender.tab.windowId)
        .catch((e) => {
          logger.error("Plugin Close", name, e);
        });
    }
  }

  private sendRequests = () => {
    // no queued requests -> done
    if (this.requestQueue.length <= 0) {
      return;
    }

    // open popup if we dont have one.
    if (!this.port) {
      this.openPopup(v4());
      return;
    }

    // send all pending requests
    this.port.postMessage({
      channel: CHANNEL_SECURE_UI_REQUEST,
      data: this.requestQueue.map((queued) => {
        logger.debug("Request", queued.request);
        return queued.request;
      }),
    });
    const portName = this.port.name;
    // move requests to responseQueue to wait for response.
    this.responseQueue.push(
      ...this.requestQueue.map((request) => ({ ...request, portName }))
    );
    this.requestQueue = [];

    // Focus window to bring it to front.
    // Since port comes from onConnect, tab/window information is available.
    if (this.port.sender?.tab?.windowId) {
      globalThis.chrome?.windows
        .update(this.port.sender?.tab?.windowId, {
          focused: true,
        })
        .catch((e) => {
          logger.error("window.update", e);
        });
    }
  };

  private openPopup = (windowId: string) => {
    this.lastOpenedWindowId = windowId;
    openPopupWindow("popup.html?windowId=" + windowId).catch((e) => {
      logger.error("openPopup", e);
    });
  };
}
