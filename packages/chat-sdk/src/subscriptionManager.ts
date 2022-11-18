export const HOST = "http://localhost:8113/v1/graphql";

export const HEADERS = {};
import { createClient, type Sink } from "graphql-ws";
import { chainOptions, SubscriptionThunder } from "./zeus"; // keep

export const apiSubscription = (options: chainOptions) => {
  const client = createClient({
    url: String(options[0]),
    connectionParams: {
      headers: Object.fromEntries(new Headers(options[1]?.headers).entries()),
    },
  });

  const ws = new Proxy(
    {
      close: () => client.dispose(),
    } as WebSocket,
    {
      get(target, key) {
        if (key === "close") return target.close;
        throw new Error(
          `Unimplemented property '${String(
            key
          )}', only 'close()' is available.`
        );
      },
    }
  );

  return (query: string) => {
    let onMessage: ((event: any) => void) | undefined;
    let onError: Sink["error"] | undefined;
    let onClose: Sink["complete"] | undefined;

    client.subscribe(
      { query },
      {
        next({ data }) {
          onMessage && onMessage(data);
        },
        error(error) {
          onError && onError(error);
        },
        complete() {
          onClose && onClose();
        },
      }
    );

    return {
      ws,
      on(listener: typeof onMessage) {
        onMessage = listener;
      },
      error(listener: typeof onError) {
        onError = listener;
      },
      open(listener: (socket: unknown) => void) {
        client.on("opened", listener);
      },
      off(listener: typeof onClose) {
        onClose = listener;
      },
    };
  };
};

export const Subscription = (...options: chainOptions) =>
  SubscriptionThunder(apiSubscription(options));
