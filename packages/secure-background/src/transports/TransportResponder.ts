import type { SECURE_EVENTS } from "../types/events";
import type {
  SecureRequest,
  SecureResponse,
  TransportHandler,
} from "../types/transports";

export class TransportResponder<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportResponder<T, R>
{
  public readonly name: T;
  public readonly event: SecureRequest<T>;
  public readonly request: SecureRequest<T>["request"];
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

    handler(this).catch((error) => {
      onResponse({
        name: this.event.name,
        id: this.event.id,
        error,
      });
    });
  }

  public respond = (response: SecureResponse<T, R>["response"]) => {
    this.onResponse({
      name: this.event.name,
      id: this.event.id,
      response,
    });
    return "RESPONDED" as const;
  };

  public error = (error: any) => {
    this.onResponse({
      name: this.event.name,
      id: this.event.id,
      error,
    });
    return "RESPONDED" as const;
  };
}
