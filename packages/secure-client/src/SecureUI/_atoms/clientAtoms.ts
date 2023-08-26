import { UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { atom, DefaultValue, selector } from "recoil";
import { v4 } from "uuid";

export const secureBackgroundSenderAtom = atom<TransportSender>({
  key: "secureBackgroundSenderAtom",
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export const secureUIReceiverAtom = atom<
  TransportReceiver<SECURE_EVENTS, "uiResponse">
>({
  key: "secureUIReceiverAtom",
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export const userClientAtom = selector<UserClient>({
  key: "userClientAtom",
  get: ({ get }) => {
    const secureBackgroundSender = get(secureBackgroundSenderAtom);
    return new UserClient(secureBackgroundSender);
  },
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export type QueuedRequest<T extends SECURE_EVENTS = SECURE_EVENTS> = {
  event: SecureRequest<T>;
  name: SecureRequest<T>["name"];
  request: SecureRequest<T>["request"];
  queueId: string;
  error: (error: any) => void;
  respond: (response: SecureResponse<T, "uiResponse">["response"]) => void;
};

// access queue via currentRequestAtom
export const requestQueueAtom = atom<QueuedRequest[]>({
  key: "requestQueueAtom",
  default: [],
  effects: [
    ({ getPromise, setSelf }) => {
      let destroy: TransportRemoveListener | null;

      const removeId = (queueId: string) => {
        setSelf((queue) => {
          if (queue instanceof DefaultValue) {
            return [];
          }
          return queue.filter((request) => request.queueId !== queueId);
        });
      };

      // console.log("PCA requestQueueAtom effect");
      getPromise(secureUIReceiverAtom)
        .then((receiver) => {
          // console.log("PCA LISTENER setup");
          destroy = receiver.setHandler(async (event) => {
            // console.log("PCA SECURE UI queue atom received", event);
            let resolve: (response: ReturnType<typeof event.respond>) => void;
            const promise = new Promise<ReturnType<typeof event.respond>>(
              (_resolve) => {
                resolve = _resolve;
              }
            );
            const queueId = v4();
            const sendResponse: typeof event.respond =
              event.respond.bind(event);
            const sendError: typeof event.error = event.error.bind(event);

            const queuedRequest: QueuedRequest = {
              event: event.event,
              name: event.name,
              request: event.request,
              queueId,
              error: (error: any) => {
                removeId(queueId);
                resolve(sendError(error));
              },
              respond: (response) => {
                removeId(queueId);
                resolve(sendResponse(response));
              },
            };

            setSelf((queue) => {
              // console.log("setself PCA", queue);
              if (queue instanceof DefaultValue) {
                return [queuedRequest];
              }
              return [queuedRequest, ...queue];
            });

            return promise;
          });
        })
        .catch((e) => {
          console.error(e);
        });

      setSelf((queue) => {
        if (queue instanceof DefaultValue) {
          return [];
        }
        return queue;
      });

      return () => {
        // console.log("PCA", "listener destroyed");
        destroy && destroy();
      };
    },
  ],
});

export const currentRequestAtom = selector<QueuedRequest | null>({
  key: "currentRequest",
  get: ({ get }) => {
    const queue = get(requestQueueAtom);
    return queue[0] ?? null;
  },
});
