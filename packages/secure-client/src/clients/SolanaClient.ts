import type {
  PassThroughToUI,
  SECURE_SVM_SIGN_MESSAGE,
  TransportSender,
} from "@coral-xyz/secure-background/clients";
import { SVMClient } from "@coral-xyz/secure-background/clients";

export class SolanaClient {
  private secureSvmClient: SVMClient;

  constructor(client: TransportSender) {
    this.secureSvmClient = new SVMClient(client);
  }

  public signMessage(
    request: SECURE_SVM_SIGN_MESSAGE["request"],
    displayOptions?: PassThroughToUI
  ): Promise<string | null> {
    return this.secureSvmClient.signMessage(request, displayOptions);
  }
}
