import type { SECURE_EVENTS } from "../types/events";
import type {
  SecureRequest,
  SecureResponse,
  TransportSender,
} from "../types/transports";

export class SecureUIClient<T extends SECURE_EVENTS = SECURE_EVENTS> {
  constructor(private client: TransportSender<T, "uiResponse" | "response">) {}

  public confirm<X extends T = T>(
    request: SecureRequest<X>
  ): Promise<SecureResponse<X, "uiResponse">> {
    return this.client.send(request);
  }

  public ledgerSign<X extends T = T>(
    request: SecureRequest<X>
  ): Promise<SecureResponse<X, "response">> {
    return this.client.send(request);
  }
}
