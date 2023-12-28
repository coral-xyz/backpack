import { getLogger } from "@coral-xyz/common";

import type { SECURE_EVENTS, SecureEvent } from "../events";
import type {
  SecureEventError,
  SecureRequest,
  SecureRequestType,
  SecureResponse,
  TransportHandler,
} from "../types/transports";

const logger = getLogger("secure-background TransportResponder");

type ResponseHookHandler<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = (eventResponse: SecureResponse<T, R>) => Promise<void>;

export class TransportResponder<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> {
  public readonly name: T;
  public readonly id: string | number;
  public readonly hash: string;
  public readonly event: SecureRequest<T, R>;
  public readonly request: SecureRequest<T, R>["request"];
  public readonly uiOptions: SecureRequest<T, R>["uiOptions"];
  public responded = false;
  private onResponse: (response: SecureResponse<T, R>) => void;
  private beforeResponseHandler: Array<ResponseHookHandler<T, R>> = [];
  private afterResponseHandler: Array<ResponseHookHandler<T, R>> = [];

  constructor({
    request,
    handler,
    onResponse,
  }: {
    request: SecureRequest<T, R>;
    handler: TransportHandler<T, R>;
    onResponse: (response: SecureResponse<T, R>) => void;
  }) {
    this.event = request;
    this.request = request.request as SecureRequest<T, R>["request"];
    this.uiOptions = request.uiOptions as SecureRequest<T, R>["uiOptions"];
    this.hash = JSON.stringify({ ...request, id: "" });

    this.onResponse = onResponse;
    this.name = request.name;
    this.id = request.id;

    const returns = handler(this);

    if (returns) {
      logger.debug("Handling", request.name, request.id);
      returns.catch((error) => {
        this.catchError(error);
      });
    }
  }
  private catchError(error: Error) {
    try {
      if (
        !("message" in error && "stack" in error && "name" in error) &&
        !(error instanceof Error)
      ) {
        error = new Error(
          typeof error === "string" ? error : JSON.stringify(error)
        );
      }
    } catch (e: any) {
      logger.error(e.toString());
      error = new Error("Error while handling request.");
    }

    const secureError: SecureEventError = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };

    this.onResponse({
      name: this.event.name,
      id: this.event.id,
      origin: this.event.origin as SecureEvent<T>["origin"],
      error: secureError as SecureEvent<T>["error"],
    });
  }
  private sendResponse(eventResponse: SecureResponse<T, R>) {
    if (!this.responded) {
      this.responded = true;
      Promise.all(
        this.beforeResponseHandler.map((handler) => handler(eventResponse))
      )
        .then(() => {
          this.onResponse(eventResponse);
        })
        .then(() =>
          Promise.all(
            this.afterResponseHandler.map((handler) => handler(eventResponse))
          )
        )
        .catch((e) => this.catchError(e));
    }
  }

  public addBeforeResponseHandler(handler: ResponseHookHandler<T, R>) {
    this.beforeResponseHandler.push(handler);
  }

  public removeBeforeResponseHandler(handler: ResponseHookHandler<T, R>) {
    const index = this.beforeResponseHandler.indexOf(handler);
    this.beforeResponseHandler.splice(index, 1);
  }

  public addAfterResponseHandler(handler: ResponseHookHandler<T, R>) {
    this.afterResponseHandler.push(handler);
  }

  public removeAfterResponseHandler(handler: ResponseHookHandler<T, R>) {
    const index = this.afterResponseHandler.indexOf(handler);
    this.afterResponseHandler.splice(index, 1);
  }

  public respond: SecureResponse<T, R>["response"] extends undefined
    ? (response?: SecureResponse<T, R>["response"]) => void
    : (response: NonNullable<SecureResponse<T, R>["response"]>) => void = (
    response: any
  ) => {
    const eventResponse = {
      name: this.event.name,
      origin: this.event.origin,
      id: this.event.id,
      response,
    };
    this.sendResponse(eventResponse);
  };

  public error = (error: Error | SecureEventError) => {
    const secureError: SecureEventError = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
    const eventResponse = {
      name: this.event.name,
      id: this.event.id,
      origin: this.event.origin,
      error: secureError as SecureEvent<T>["error"],
    };

    this.sendResponse(eventResponse);
  };
}
