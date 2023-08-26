import type { SecureRequest, TransportSender } from "../../types/transports";

export class EVMClient {
  constructor(private secureBackgroundClient: TransportSender) {}

  public async signMessage(
    request: SecureRequest<"SECURE_EVM_SIGN_MESSAGE">["request"]
  ) {
    await this.secureBackgroundClient.send({
      name: "SECURE_EVM_SIGN_MESSAGE",
      request,
    });
  }
}
