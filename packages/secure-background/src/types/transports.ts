import type { TransportResponder } from "../transports/TransportResponder";

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
    | Uint8Array
    | Uint8Array[]
    | SerializableJson
    | SerializableJson[];
};

export type { TransportResponder } from "../transports/TransportResponder";

export type PassThroughToUI = SerializableJson;

export type SecureEventOrigin = {
  context: "xnft" | "web" | "extension" | "mobile";
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

export type SecureRequest<T extends SECURE_EVENTS = SECURE_EVENTS> = {
  name: T;
  origin: SecureEvent<T>["origin"];
  id?: SecureEvent<T>["id"];
  request: SecureEvent<T>["request"];
  confirmOptions?: SecureEvent<T>["confirmOptions"];
};

export type SecureResponse<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = {
  name: T;
  id?: SecureEvent<T>["id"];
  response?: R extends "response"
    ? SecureEvent<T>["response"]
    : SecureEvent<T>["confirmationResponse"];
  error?: SecureEvent<T>["error"];
};

// TransportReceiver

export interface TransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> {
  setHandler: (handler: TransportHandler<T, R>) => TransportRemoveListener;
}

export type TransportRemoveListener = () => void;

export type TransportHandlers<T extends SECURE_EVENTS> = Record<
  T,
  TransportHandler<T>
>;

export type TransportHandler<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = (request: TransportResponder<T, R>) => Promise<"RESPONDED">;

// TransportSender

export interface TransportSender<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> {
  send: TransportSend<T, R>;
}

export type TransportSend<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = <X extends T = T>(
  request: SecureRequest<X>
) => Promise<SecureResponse<X, R>>;
