import type { SecureRequest, TransportSender } from "../../types/transports";

import type { SECURE_USER_UNLOCK_KEYRING } from "./events";

export class UserClient {
  constructor(private secureBackgroundClient: TransportSender) {}

  public async unlockKeyring(
    request: SecureRequest<SECURE_USER_UNLOCK_KEYRING>["request"]
  ) {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_UNLOCK_KEYRING",
      request,
    });
  }
}
