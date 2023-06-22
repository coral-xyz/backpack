import { getLogger } from "@coral-xyz/common";

import type { SECURE_EVENTS } from "../types/events";
import type {
  SecureRequest,
  SecureResponse,
  TransportHandler,
} from "../types/transports";

const logger = getLogger("secure-background TransportResponder");

export class TransportResponder<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> {
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

    const returns = handler(this);

    if (returns) {
      logger.debug("Handling", event);
      returns.catch((error) => {
        onResponse({
          name: this.event.name,
          id: this.event.id,
          error,
        });
      });
    }
  }

  public respond = (response: SecureResponse<T, R>["response"]) => {
    const eventResponse = {
      name: this.event.name,
      id: this.event.id,
      response,
    };
    logger.debug("Response", eventResponse);
    this.onResponse(eventResponse);
    return "RESPONDED" as const;
  };

  public error = (error: any) => {
    const eventResponse = {
      name: this.event.name,
      id: this.event.id,
      error,
    };
    logger.error("Response", eventResponse);
    this.onResponse(eventResponse);
    return "RESPONDED" as const;
  };
}
