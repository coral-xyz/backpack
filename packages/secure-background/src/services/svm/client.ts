import type { PassThroughToUI, TransportSender } from "../../types/transports";
import type { SECURE_SVM_SIGN_MESSAGE } from "../svm/events";

export class SVMClient {
  constructor(private client: TransportSender) {}

  public signMessage(
    request: SECURE_SVM_SIGN_MESSAGE["request"],
    displayOptions?: PassThroughToUI
  ): Promise<string | null> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_MESSAGE",
        request,
        displayOptions,
      })
      .then((response) => response?.response?.singedMessage);
  }
}
