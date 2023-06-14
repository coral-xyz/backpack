import { SVMClient } from "@coral-xyz/secure-background/clients";
import type {
  PassThroughToUI,
  SECURE_SVM_SIGN_MESSAGE,
  SecureEventOrigin,
  TransportSender,
} from "@coral-xyz/secure-background/types";

export class SolanaClient {
  private secureSvmClient: SVMClient;

  constructor(client: TransportSender, origin: SecureEventOrigin) {
    this.secureSvmClient = new SVMClient(client, origin);
  }

  public signMessage(
    request: SECURE_SVM_SIGN_MESSAGE["request"],
    displayOptions?: PassThroughToUI
  ): Promise<string | null> {
    return this.secureSvmClient.signMessage(request, displayOptions);
  }
}
