import type { SecureRequest, TransportClient } from "../../types";

import type { SECURE_EVM_EVENTS, SECURE_EVM_SIGN_MESSAGE } from "./events";

export class EVMClient {
  constructor(
    private secureBackgroundClient: TransportClient<SECURE_EVM_EVENTS>
  ) {}

  public async signMessage(
    request: SecureRequest<SECURE_EVM_SIGN_MESSAGE>["request"]
  ) {
    await this.secureBackgroundClient.request({
      name: "SECURE_EVM_SIGN_MESSAGE",
      request,
    });
  }
}
