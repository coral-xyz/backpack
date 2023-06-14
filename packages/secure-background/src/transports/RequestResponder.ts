import type { SECURE_EVENTS } from "../types/events";
import type {
  SecureEventBase,
  SecureRequest,
  SecureResponse,
  SecuresResponseType,
  TransportHandler,
} from "../types/transports";

export class RequestResponder<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecuresResponseType = SecuresResponseType.response
> {
  public event: SecureRequest<T>;
  public request: SecureRequest<T>["request"];
  public name: T;
  private onResponse: (response: SecureResponse<T, R>) => void;

  constructor({
    request,
    handler,
    onResponse,
  }: {
    request: SecureRequest<T>;
    handler: TransportHandler<T, R>;
    onResponse: (response: SecureResponse<T, R>) => void;
  }) {
    this.event = request;
    this.request = request.request;
    this.onResponse = onResponse;
    this.name = request.name;

    try {
      handler(this);
    } catch (error) {
      onResponse({
        name: this.event.name,
        id: this.event.id,
        error,
      } as SecureResponse<T, R>);
    }
  }

  public respond = (response: SecureResponse<T, R>["response"]) => {
    this.onResponse({
      name: this.event.name,
      id: this.event.id,
      response,
    } as SecureResponse<T, R>);
  };

  public error = (error: any) => {
    this.onResponse({
      name: this.event.name,
      id: this.event.id,
      error,
    } as SecureResponse<T, R>);
  };
}
