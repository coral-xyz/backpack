import type { SecureRequest, TransportSender } from "../../types/transports";

import type { SECURE_EVM_EVENTS, SECURE_EVM_SIGN_MESSAGE } from "./events";

export class EVMClient {
  constructor(private secureBackgroundClient: TransportSender) {}

  public async signMessage(
    request: SecureRequest<SECURE_EVM_SIGN_MESSAGE>["request"]
  ) {
    await this.secureBackgroundClient.send({
      name: "SECURE_EVM_SIGN_MESSAGE",
      request,
    });
  }
}
