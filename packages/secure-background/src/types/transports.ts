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
  context:
    | "xnft"
    | "browser"
    | "background"
    | "extension"
    | "mobile"
    | "secureUI";
  name: string;
  address: string;
};

export type SecureResponseType = "response" | "uiResponse";

export interface SecureEventBase<T extends SECURE_EVENTS = SECURE_EVENTS> {
  name: T;
  origin: SecureEventOrigin;
  id: string | number;
  request: SerializableJson;
  response?: SerializableJson;
  uiOptions?: PassThroughToUI;
  uiResponse?: SerializableJson;
  error?: any;
}

export type SecureRequest<T extends SECURE_EVENTS = SECURE_EVENTS> = {
  name: T;
  origin: SecureEvent<T>["origin"];
  id: SecureEvent<T>["id"];
  request: SecureEvent<T>["request"];
  uiOptions?: SecureEvent<T>["uiOptions"];
};

export type SecureResponse<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureResponseType = "response"
> = {
  name: T;
  id: SecureEvent<T>["id"];
  response?: R extends "response"
    ? SecureEvent<T>["response"]
    : SecureEvent<T>["uiResponse"];
  error?: SecureEvent<T>["error"];
};

// TransportReceiver

export interface TransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureResponseType = "response"
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
  R extends SecureResponseType = "response"
> = (request: TransportResponder<T, R>) => Promise<"RESPONDED">;

// TransportSender

export interface TransportSender<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureResponseType = "response"
> {
  send: TransportSend<T, R>;
}

export type TransportSend<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureResponseType = "response"
> = <X extends T = T>(
  request: Omit<SecureRequest<X>, "origin" | "id">
) => Promise<SecureResponse<X, R>>;

export interface TransportBroadcaster {
  broadcast: (request: any) => Promise<void>;
}

export type TransportQueuedRequest<
  X extends SECURE_EVENTS,
  R extends SecureResponseType = "response"
> = {
  request: SecureRequest;
  resolve: (resonse: SecureResponse<X, R>) => void;
};
