import { SVMClient } from "@coral-xyz/secure-background/clients";
import type {
  SecureEvent,
  TransportSender,
} from "@coral-xyz/secure-background/types";

export class SolanaClient {
  private secureSvmClient: SVMClient;

  constructor(client: TransportSender) {
    this.secureSvmClient = new SVMClient(client);
  }

  public signMessage(
    request: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["request"],
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<string | null> {
    return this.secureSvmClient.signMessage(request, confirmOptions);
  }
}
