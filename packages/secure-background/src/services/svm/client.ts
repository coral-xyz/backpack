import type { TransportSender } from "../../types/transports";
import type { SECURE_SVM_SIGN_MESSAGE } from "../svm/events";

export class SVMClient {
  constructor(private client: TransportSender) {}

  public signMessage(
    request: SECURE_SVM_SIGN_MESSAGE["request"],
    confirmOptions: SECURE_SVM_SIGN_MESSAGE["confirmOptions"]
  ): Promise<string | null> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_MESSAGE",
        request,
        confirmOptions,
      })
      .then((response) => {
        console.log("PCA svm client response received", response);
        if ("error" in response) {
          throw response;
        }
        return response?.response?.singedMessage ?? null;
      });
  }
}
