import {
  CHANNEL_SECURE_UI_REQUEST,
  CHANNEL_SECURE_UI_RESPONSE,
  getLogger,
  isValidEventOrigin,
} from "@coral-xyz/common";
import { TransportResponder } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureRequestType,
  SecureResponse,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";

const logger = getLogger("secure-ui ToSecureUITransportReceiver");

export class ToSecureUITransportReceiver<
  X extends SECURE_EVENTS,
  R extends SecureRequestType = undefined
> implements TransportReceiver<X, R>
{
  private handler: TransportHandler<X, R> | null = null;
  private queuedRequests: SecureRequest<X, R>[] = [];
  private port?: chrome.runtime.Port;

  constructor(windowId: string) {
    // Tell all existing extension instances that this instance now exists.
    // This block ensures a single extension window is open at any given time.
    globalThis.chrome?.runtime
      ?.sendMessage("new-instance-was-opened")
      .then(() => {
        // Close all existing extension instances so only the newest is running
        globalThis.chrome?.runtime?.onMessage?.addListener((msg, sender) => {
          if (isValidEventOrigin(sender) && msg === "new-instance-was-opened") {
            window.close();
          }
        });
      })
      .catch(console.error);

    // Send connect event to background script to open channel.
    // add unique name so background can identify the popup.
    this.port = globalThis.chrome?.runtime?.connect({ name: windowId });
    this.port?.onMessage?.addListener(this.listener.bind(this));
  }

  private listener = (message: {
    channel: string;
    data: SecureRequest<X, R>[];
  }) => {
    if (message.channel !== CHANNEL_SECURE_UI_REQUEST) {
      return;
    }

    const handler = this.handler;
    if (handler) {
      message.data.forEach((request) => {
        new TransportResponder({
          request,
          handler,
          onResponse: (result) => {
            this.sendResponse(request, result);
          },
        });
      });
    } else {
      this.queuedRequests.push(...message.data);
    }
  };

  public setHandler = (newHandler: TransportHandler<X, R>) => {
    this.handler = newHandler;

    this.listener({
      channel: CHANNEL_SECURE_UI_REQUEST,
      data: this.queuedRequests,
    });
    this.queuedRequests = [];

    return () => {};
    // const newTestRequest = () => {
    //   const testRequest = {
    //     name: "SECURE_EVM_SIGN_TX",
    //     request: {
    //       txHex:
    //         "0x02ea01820135843b9aca00850673d8bef48252089400000000000000000000000000000000000000000180c0",
    //       publicKey: "0x668EC8c20fc5de4aE0a5347801cbC19c6c234563",
    //     },
    //     origin: {
    //       address: "secure-background",
    //       name: "Backpack",
    //       context: "background",
    //     },
    //     id: "27e3c45d-76b5-4b35-be52-bacc2a600fe4",
    //     uiOptions: {
    //       nonce: 309,
    //       gasLimit: "21000",
    //       maxPriorityFeePerGas: "1000000000",
    //       maxFeePerGas: "27713388276",
    //     },
    //   } as SecureRequest<X, R>;

    //   new TransportResponder({
    //     request: testRequest,
    //     handler,
    //     onResponse: (result) => {
    //       console.log("PCA", "RESPONDED", result);
    //       newTestRequest();
    //     },
    //   });
    // };

    // const listener = (message: {
    //   channel: string;
    //   data: SecureRequest<X, R>[];
    // }) => {

    // };
    // this.port.onMessage.addListener(listener);
    // // newTestRequest();
    // return () => {
    //   this.port.onMessage.removeListener(listener);
    // };
  };

  private sendResponse = (
    request: SecureRequest<X>,
    response: SecureResponse<X, R>
  ) => {
    try {
      this.port?.postMessage({
        channel: CHANNEL_SECURE_UI_RESPONSE,
        data: {
          ...response,
          id: request.id,
        },
      });
    } catch (e) {
      logger.error(String(e));
    }
  };
}
