import type { KeyringStore } from "../../store/keyring";
import type {
  SecureRequest,
  TransportHandler,
  TransportHandlers,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";

import type { SECURE_EVM_EVENTS } from "./events";

export class EVMService {
  public destroy: TransportRemoveListener;

  constructor(
    server: TransportReceiver<SECURE_EVM_EVENTS>,
    private uiClient: TransportSender<SECURE_EVM_EVENTS>,
    private keystore: KeyringStore
  ) {
    this.destroy = server.setHandler(this.eventHandler);
  }

  private eventHandler: TransportHandler<SECURE_EVM_EVENTS> = (request) => {
    const handlers: TransportHandlers<SECURE_EVM_EVENTS> = {
      SECURE_EVM_SIGN_MESSAGE: this.handleSignMessage,
      SECURE_EVM_SIGN_TX: this.handleSign,
    };

    const handler = handlers[request.name]?.bind(this);
    return handler && handler(request);
  };

  private handleSignMessage: TransportHandler<"SECURE_EVM_SIGN_MESSAGE"> =
    async (request) => {
      throw "Not Implemented";
    };

  private handleSign: TransportHandler<"SECURE_EVM_SIGN_TX"> = async (
    request
  ) => {
    throw "Not Implemented";
  };
}
