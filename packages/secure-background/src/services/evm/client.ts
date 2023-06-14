import type {
  SecureEventOrigin,
  SecureRequest,
  TransportSender,
} from "../../types/transports";

import type { SECURE_EVM_EVENTS, SECURE_EVM_SIGN_MESSAGE } from "./events";

export class EVMClient {
  constructor(
    private secureBackgroundClient: TransportSender,
    private origin: SecureEventOrigin
  ) {}

  public async signMessage(
    request: SecureRequest<SECURE_EVM_SIGN_MESSAGE>["request"]
  ) {
    await this.secureBackgroundClient.send({
      name: "SECURE_EVM_SIGN_MESSAGE",
      origin: this.origin,
      request,
    });
  }
}
