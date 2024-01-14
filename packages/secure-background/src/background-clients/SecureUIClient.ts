import type { SECURE_EVENTS, SecureEvent } from "../events";
import type {
  SecureRequest,
  SecureRequestType,
  SecureResponse,
  TransportSender,
} from "../types/transports";

export class SecureUIClient<T extends SECURE_EVENTS = SECURE_EVENTS> {
  constructor(private client: TransportSender<T, SecureRequestType>) {}

  public confirm<X extends T = T>(
    request: SecureRequest<X & T>,
    uiOptions: SecureEvent<X & T>["uiOptions"]
  ): Promise<SecureResponse<X & T, "ui">> {
    // @ts-ignore - some versions of TS complain here due to not understanding X & T above
    return this.client.send({ ...request, uiOptions });
  }

  public ledgerSign<X extends T = T>(
    request: SecureRequest<X & T>
  ): Promise<SecureResponse<X & T>> {
    // @ts-ignore - some versions of TS complain here due to not understanding X & T above
    return this.client.send(request);
  }
}
