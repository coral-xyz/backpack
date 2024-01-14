import type { SECURE_EVENTS, SecureEvent } from "../events";
import type {
  SECURE_NOTIFICATIONS,
  SecureNotification,
} from "../notifications";
import type { TransportResponder } from "../transports/TransportResponder";

type SerializeableValues =
  | undefined
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

export type SerializableJson = {
  [key: string]: SerializeableValues;
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

export type SecureRequestType = "ui" | undefined;

export type SecureEventError = {
  message: string;
  name?: string;
  stack?: string;
};

export interface SecureEventBase<T extends SECURE_EVENTS = SECURE_EVENTS> {
  name: T;
  id: string | number;
  request: SerializableJson;
  origin: SecureEventOrigin;
  uiOptions: SerializableJson | undefined;
  allowResubmission?: true;
  response?: SerializableJson;
  uiResponse?: SerializableJson;
  error?: SecureEventError;
}

export type SecureRequestOptions<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = undefined extends SecureEvent<T>["uiOptions"]
  ? {
      origin?: SecureEventOrigin;
    }
  : {
      origin?: SecureEventOrigin;
      uiOptions?: SecureRequest<T, R>["uiOptions"];
    };
export type SecureRequest<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = {
  name: T;
  origin: SecureEvent<T>["origin"];
  id: SecureEvent<T>["id"];
  request: SecureEvent<T>["request"];
  allowResubmission?: SecureEvent<T>["allowResubmission"];
  uiOptions?: SecureEvent<T>["uiOptions"];
} & (R extends "ui"
  ? {
      uiOptions: SecureEvent<T>["uiOptions"];
    }
  : {
      uiOptions?: SecureEvent<T>["uiOptions"];
    });

export type SecureResponse<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = {
  name: T;
  id: SecureEvent<T>["id"];
  origin: SecureEvent<T>["origin"];
  response?: R extends "ui"
    ? SecureEvent<T>["uiResponse"] extends SerializableJson
      ? SecureEvent<T>["uiResponse"]
      : undefined
    : SecureEvent<T>["response"] extends SerializableJson
    ? SecureEvent<T>["response"]
    : undefined;
  error?: SecureEvent<T>["error"];
};

// TransportReceiver

export interface TransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
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
  R extends SecureRequestType = undefined
> = (request: TransportResponder<T, R>) => Promise<void>;

// TransportSender

export interface TransportSender<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> {
  send: TransportSend<T, R>;
}

export type TransportSendRequest<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = Omit<SecureRequest<T, R>, "origin" | "id"> &
  Partial<Pick<SecureRequest<T, R>, "origin">>;

export type TransportSend<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = <X extends T = T>(
  request: TransportSendRequest<X, R>
) => Promise<SecureResponse<X, R>>;

export type TransportQueuedRequest<
  T extends SECURE_EVENTS,
  R extends SecureRequestType = undefined
> = {
  request: SecureRequest<T, R>;
  resolve: (response: SecureResponse<T, R>) => void;
};

// Transport Broadcaster

export interface SecureNotificationBase<T extends SECURE_NOTIFICATIONS> {
  name: T;
  data?: SerializableJson;
}

export interface TransportBroadcaster<
  T extends SECURE_NOTIFICATIONS = SECURE_NOTIFICATIONS
> {
  broadcast: (notification: SecureNotification<T>) => void;
}

export interface TransportBroadcastListener<
  T extends SECURE_NOTIFICATIONS = SECURE_NOTIFICATIONS
> {
  addListener: (
    handler: (notification: SecureNotification<T>) => void
  ) => TransportRemoveListener;
}
