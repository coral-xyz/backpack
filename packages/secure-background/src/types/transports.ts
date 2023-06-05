import type { SECURE_EVENTS, SecureEvent } from "./events";

type SerializableJson = {
  [key: string]:
    | null
    | boolean
    | boolean[]
    | string
    | string[]
    | number
    | number[]
    | SerializableJson
    | SerializableJson[];
};

export type PassThroughToUI = SerializableJson;

export interface SecureEventBase<T extends SECURE_EVENTS = SECURE_EVENTS> {
  name: T;
  id?: string | number;
  request: SerializableJson;
  displayOptions?: PassThroughToUI;
  response?: SerializableJson;
  error?: string;
}

export type SecureRequest<
  T extends SecureEventBase | SECURE_EVENTS = SECURE_EVENTS
> = T extends SecureEventBase
  ? {
      name: T["name"];
      id?: T["id"];
      request: T["request"];
      displayOptions?: T["displayOptions"];
    }
  : T extends SECURE_EVENTS
  ? {
      name: T;
      id?: SecureEvent<T>["id"];
      request: SecureEvent<T>["request"];
      displayOptions?: SecureEvent<T>["displayOptions"];
    }
  : never;

export type SecureResponse<
  T extends SecureEventBase | SECURE_EVENTS = SECURE_EVENTS
> = T extends SecureEventBase
  ? {
      name: T["name"];
      id?: T["id"];
      response: T["response"] extends undefined ? undefined : T["response"];
      error?: T["error"];
    }
  : T extends SECURE_EVENTS
  ? {
      name: T;
      id?: SecureEvent<T>["id"];
      response: SecureEvent<T>["response"] extends undefined
        ? undefined
        : SecureEvent<T>["response"];
      error?: SecureEvent<T>["error"];
    }
  : never;

// TransportReceiver

export interface TransportReceiver<T extends SECURE_EVENTS = SECURE_EVENTS> {
  setHandler: (handler: TransportHandler<T>) => TransportRemoveListener;
}

export type TransportRemoveListener = () => void;

export type TransportHandler<T extends SecureEventBase | SECURE_EVENTS> = (
  request: SecureRequest<T>
) => Promise<SecureResponse<T>>;

// TransportSender

export interface TransportSender<T extends SECURE_EVENTS = SECURE_EVENTS> {
  send: TransportSend<T>;
}

export type TransportSend<
  T extends SecureEventBase | SECURE_EVENTS = SECURE_EVENTS
> = <X extends T>(request: SecureRequest<X>) => Promise<SecureResponse<X>>;
