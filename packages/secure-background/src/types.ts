import type { SECURE_EVENTS, SecureEvent } from "./events";

export interface SecureEventBase<T extends SECURE_EVENTS = SECURE_EVENTS> {
  name: T;
  request: { [key: string]: string | number | null };
  response?: { [key: string]: string | number | null };
}

export type SecureRequest<T extends SecureEventBase | SECURE_EVENTS> =
  T extends SECURE_EVENTS
    ? {
        name: T;
        request: SecureEvent<T>["request"];
      }
    : T extends SecureEventBase
    ? {
        name: T["name"];
        request: T["request"];
      }
    : never;

export type SecureResponse<T extends SecureEventBase | SECURE_EVENTS> =
  T extends SecureEventBase
    ? {
        name: T["name"];
        response: T["response"] extends undefined ? undefined : T["response"];
      }
    : T extends SECURE_EVENTS
    ? {
        name: T;
        response: SecureEvent<T>["response"] extends undefined
          ? undefined
          : SecureEvent<T>["response"];
      }
    : never;

// TransportServer

export interface TransportServer<T extends SECURE_EVENTS = SECURE_EVENTS> {
  setListener: (handler: TransportHandler<T>) => TransportRemoveListener;
}

export type TransportRemoveListener = () => void;

export type TransportHandler<T extends SecureEventBase | SECURE_EVENTS> = (
  request: SecureRequest<T>
) => Promise<SecureResponse<T>>;

// TransportClient

export interface TransportClient<T extends SECURE_EVENTS = SECURE_EVENTS> {
  request: TransportClientRequest<T>;
}

export type TransportClientRequest<
  T extends SecureEventBase | SECURE_EVENTS = SECURE_EVENTS
> = <X extends T>(request: SecureRequest<X>) => Promise<SecureResponse<X>>;
