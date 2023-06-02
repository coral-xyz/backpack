import type { TransportClient } from "../../types";
import type { SECURE_SVM_SIGN_MESSAGE } from "../svm/events";

export class SVMClient {
  constructor(private client: TransportClient) {}

  public signMessage(
    request: SECURE_SVM_SIGN_MESSAGE["request"]
  ): Promise<string | null> {
    return this.client
      .request({
        name: "SECURE_SVM_SIGN_MESSAGE",
        request,
      })
      .then((response) => response?.response?.singedMessage);
  }
}
