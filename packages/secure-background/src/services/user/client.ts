import type {
  SecureEventOrigin,
  TransportSender,
} from "../../types/transports";

import type { SECURE_USER_UNLOCK_KEYRING } from "./events";

export class UserClient {
  constructor(
    private secureBackgroundClient: TransportSender,
    private origin: SecureEventOrigin
  ) {}

  public async unlockKeyring(request: SECURE_USER_UNLOCK_KEYRING["request"]) {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_UNLOCK_KEYRING",
      origin: this.origin,
      request,
    });
  }
}
