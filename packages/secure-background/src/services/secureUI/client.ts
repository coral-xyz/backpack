import type { SECURE_EVENTS } from "../../types/events";
import type {
  SecureRequest,
  SecureResponse,
  TransportSender,
} from "../../types/transports";

export class SecureUIClient<T extends SECURE_EVENTS = SECURE_EVENTS> {
  constructor(private client: TransportSender<T, "confirmation">) {}

  public confirm<X extends T = T>(
    request: SecureRequest<X>
  ): Promise<SecureResponse<X, "confirmation">> {
    console.log("PCA", "confirm", request);
    return this.client.send(request);
  }
}
