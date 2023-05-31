import type { SecureRequest, TransportClient } from "../../types";

import type { SECURE_SVM_EVENTS, SECURE_SVM_SIGN_MESSAGE } from "./events";

export class SVMClient {
  constructor(private secureClient: TransportClient<SECURE_SVM_EVENTS>) {}

  public async signMessage(
    request: SecureRequest<SECURE_SVM_SIGN_MESSAGE>["request"]
  ) {
    await this.secureClient.request({
      name: "SECURE_SVM_SIGN_MESSAGE",
      request,
    });
  }
}
