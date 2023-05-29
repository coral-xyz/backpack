import type {
  ISecureEvent,
  SecureEvent,
  SecureResponse,
  Transport,
  TransportDestroy,
  TransportHandler,
} from "../../types";

import type {
  SECURE_SVM_EVENTS,
  SECURE_SVM_SIGN,
  SECURE_SVM_SIGN_MESSAGE,
} from "./events";

export class SVMService {
  public destroy: TransportDestroy;

  constructor(private transport: Transport<SECURE_SVM_EVENTS>) {
    this.destroy = transport.addListener(this.eventHandler);
  }

  private eventHandler: TransportHandler<SECURE_SVM_EVENTS> = (
    event,
    respond
  ) => {
    switch (event.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return this.handleSignMessage(
          event as SecureEvent<SECURE_SVM_SIGN_MESSAGE>,
          respond
        );
      case "SECURE_SVM_SIGN":
        return this.handleSign(event as SecureEvent<SECURE_SVM_SIGN>, respond);
      default: {
        // if typescript complains here, an event type/case wasn't handled.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exhaustiveCheck: never = event.name;
        // Do not throw here, it is okay for events from other handlers to fall through here.
      }
    }
  };

  private handleSignMessage: TransportHandler<SECURE_SVM_SIGN_MESSAGE> = (
    event,
    respond
  ) => {};

  private handleSign: TransportHandler<SECURE_SVM_SIGN> = (
    event,
    respond
  ) => {};
}
