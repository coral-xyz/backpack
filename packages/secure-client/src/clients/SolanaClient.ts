import { SVMClient } from "@coral-xyz/secure-background/clients";
import type {
  SecureEvent,
  SecureEventOrigin,
  TransportSender,
} from "@coral-xyz/secure-background/types";

export class SolanaClient {
  private secureSvmClient: SVMClient;

  constructor(client: TransportSender, origin: SecureEventOrigin) {
    this.secureSvmClient = new SVMClient(client, origin);
  }

  public signMessage(
    request: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["request"],
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<string | null> {
    return this.secureSvmClient.signMessage(request, confirmOptions);
  }
}
