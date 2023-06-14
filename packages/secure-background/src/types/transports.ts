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

export type SecureEventOrigin = {
  name: string;
  address: string;
};

export interface SecureEventBase<T extends SECURE_EVENTS = SECURE_EVENTS> {
  name: T;
  origin: SecureEventOrigin;
  id?: string | number;
  request: SerializableJson;
  confirmOptions?: PassThroughToUI;
  // {
  //   priority: number,
  //   component: string,
  //   props: PassThroughToUI
  // };
  confirmationResponse?: {
    confirmed: boolean;
  };
  response?: SerializableJson;
  error?: any;
}

export type SecureRequest<
  T extends SecureEventBase<SECURE_EVENTS> | SECURE_EVENTS = SECURE_EVENTS
> = T extends SecureEventBase
  ? {
      name: T["name"];
      origin: T["origin"];
      id?: T["id"];
      request: T["request"];
      confirmOptions?: T["confirmOptions"];
    }
  : T extends SECURE_EVENTS
  ? {
      name: T;
      origin: SecureEvent<T>["origin"];
      id?: SecureEvent<T>["id"];
      request: SecureEvent<T>["request"];
      confirmOptions?: SecureEvent<T>["confirmOptions"];
    }
  : never;

export type SecureResponse<
  T extends SecureEventBase<SECURE_EVENTS> | SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = T extends SecureEventBase
  ? {
      name: T["name"];
      id?: T["id"];
      response?: R extends "response"
        ? T["response"]
        : T["confirmationResponse"];
      error?: T["error"];
    }
  : T extends SECURE_EVENTS
  ? {
      name: T;
      id?: SecureEvent<T>["id"];
      response?: R extends "response"
        ? SecureEvent<T>["response"]
        : SecureEvent<T>["confirmationResponse"];
      error?: SecureEvent<T>["error"];
    }
  : never;

// export type SecureResponse<
//   T extends SecureEventBase<SECURE_EVENTS> | SECURE_EVENTS = SECURE_EVENTS
// > = T extends SecureEventBase
//   ?
//   | {
//     name: T["name"];
//     id?: T["id"];
//     response?: T["response"] extends undefined ? undefined : T["response"];
//     error?: T["error"];
//   }
//   : T extends SECURE_EVENTS
//   ?
//   | {
//     name: T;
//     id?: SecureEvent<T>["id"];
//     response?: SecureEvent<T>["response"] extends undefined
//     ? undefined
//     : SecureEvent<T>["response"];
//     error?: SecureEvent<T>["error"];

//   }
//   : never;

// TransportReceiver

export interface TransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> {
  setHandler: (handler: TransportHandler<T, R>) => TransportRemoveListener;
}

export type TransportRemoveListener = () => void;

export type TransportHandler<
  T extends SecureEventBase | SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = (request: SecureRequest<T>) => Promise<SecureResponse<T, R>>;

// TransportSender

export interface TransportSender<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> {
  send: TransportSend<T, R>;
}

export type TransportSend<
  T extends SecureEventBase | SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = <X extends T = T>(
  request: SecureRequest<X>
) => Promise<SecureResponse<X, R>>;
