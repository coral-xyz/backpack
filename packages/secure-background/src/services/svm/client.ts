import type { TransportClient } from "../../types";
import type { SECURE_SVM_SIGN_MESSAGE } from "../svm/events";

export class SVMClient {
  constructor(private client: TransportClient) {}

  public async signMessage(
    request: SECURE_SVM_SIGN_MESSAGE["request"]
  ): Promise<string> {
    console.log("PCA", "Client: signMessage", {
      name: "SECURE_SVM_SIGN_MESSAGE",
      request,
    });
    const response = await this.client.request({
      name: "SECURE_SVM_SIGN_MESSAGE",
      request,
    });

    console.log("PCA", "Client REsponse", response);
    return response.response.singedMessage;
  }
}
