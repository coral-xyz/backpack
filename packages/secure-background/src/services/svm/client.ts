import type { SecureEvent } from "../../types/events";
import type {
  SecureRequest,
  SecureResponse,
  TransportSender,
} from "../../types/transports";
import type { SECURE_SVM_SIGN_MESSAGE } from "../svm/events";

export class SVMClient {
  constructor(private client: TransportSender) {}

  public signMessage(
    request: SecureRequest<"SECURE_SVM_SIGN_MESSAGE">["request"],
    confirmOptions?: SecureRequest<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_MESSAGE">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_MESSAGE",
        request,
        confirmOptions,
      })
      .then((response) => {
        console.log("PCA svm client response received", response);
        return response;
      });
  }

  public connect(
    request?: SecureEvent<"SECURE_SVM_CONNECT">["request"],
    confirmOptions?: SecureEvent<"SECURE_SVM_CONNECT">["confirmOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_CONNECT">> {
    return this.client
      .send({
        name: "SECURE_SVM_CONNECT",
        request: request ?? {},
        confirmOptions,
      })
      .then((response) => {
        console.log("PCA svm client response received", response);
        return response;
      });
  }
}
