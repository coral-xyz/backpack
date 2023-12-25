import type {
  SECURE_EVENTS,
  SecureResponse,
  TransportReceiver,
  TransportRemoveListener,
  TransportResponder,
} from "@coral-xyz/secure-clients/types";

import { atom, DefaultValue, selector } from "recoil";

export type QueuedUiRequest<T extends SECURE_EVENTS = SECURE_EVENTS> =
  TransportResponder<T, "ui">;

export const secureUIReceiverAtom = atom<
  TransportReceiver<SECURE_EVENTS, "ui">
>({
  key: "secureUIReceiverAtom",
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

// access queue via currentRequestAtom
export const requestQueueAtom = atom<QueuedUiRequest[]>({
  key: "requestQueueAtom",
  default: [],
  effects: [
    ({ getPromise, setSelf }) => {
      let destroy: TransportRemoveListener | null;

      // console.log("PCA requestQueueAtom effect");
      getPromise(secureUIReceiverAtom)
        .then((receiver) => {
          const handler = async (event: QueuedUiRequest) => {
            // remove event from queue after sending response
            event.addAfterResponseHandler(async (response) => {
              setSelf((queue) => {
                if (queue instanceof DefaultValue) {
                  return [];
                }

                // if this event is safe to resubmit respond to all of the same type
                if (event.event.allowResubmission) {
                  const otherSameEvents = queue.filter(
                    (request) =>
                      request.id !== event.id && request.hash === event.hash
                  );
                  otherSameEvents.forEach((event) =>
                    event.respond(response.response)
                  );
                }

                const currentEvent = queue.find(
                  (request) => request.id === event.id
                );
                const newQueue = queue.filter((request) => !request.responded);

                // if there is no event or if there is only one event on the queue we keep it so we never show empty screen.
                if (newQueue.length < 1) {
                  return [currentEvent ?? queue[0]];
                }
                return newQueue;
              });
            });

            setSelf((queue) => {
              // if there is a queue -> add to it
              if (!(queue instanceof DefaultValue) && Array.isArray(queue)) {
                // if event.id already exists in queue -> replace
                const replace = queue.findIndex(
                  (queued) => queued.id === event.id
                );
                if (replace >= 0) {
                  const newQueue = [...queue];
                  newQueue[replace] = event;
                  return newQueue;
                }

                // else add new event to front of queue.
                return [event, ...queue];
              }

              // start new queue
              return [event];
            });
          };
          destroy = receiver.setHandler(handler);
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
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export const currentRequestAtom = selector<TransportResponder<
  SECURE_EVENTS,
  "ui"
> | null>({
  key: "currentRequest",
  get: ({ get }) => {
    const queue = get(requestQueueAtom);
    const nextPending = queue.find((event) => !event.responded);
    // if we dont have any pending, return the last already responded event
    // so the screen does not go blank while animating out.
    // <Presentation> automatically disables intracting with responded events.
    return nextPending ?? queue[0] ?? null;
  },
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

// additional Atom to trigger rerender when event is switched to responded
export const isCurrentRequestRespondedAtom = selector<boolean>({
  key: "isCurrentRequestResponded",
  get: ({ get }) => {
    const queue = get(requestQueueAtom);
    const nextPending = queue.find((event) => !event.responded);
    const newCurrentRequest = nextPending ?? queue[0] ?? null;
    return !!newCurrentRequest?.responded;
  },
});
