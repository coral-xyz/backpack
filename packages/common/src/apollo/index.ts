import type {
  FieldPolicy,
  NormalizedCacheObject,
  RequestHandler,
} from "@apollo/client";
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  from,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { LocalStorageWrapper, persistCacheSync } from "apollo3-cache-persist";

import { BACKEND_API_URL } from "../constants";

const cache = new InMemoryCache({
  typePolicies: {
    Wallet: {
      fields: {
        transactions: customTransactionConnectionPolicy(),
      },
    },
  },
});

type Connection = {
  edges: Array<{ node: any }>;
  pageInfo: {
    hasNextPage: boolean;
  };
};

export function customNftConnectionPolicy(): FieldPolicy {
  const emptyConnection: Connection = {
    edges: [],
    pageInfo: {
      hasNextPage: true,
    },
  };

  return {
    keyArgs: ["filters", ["addresses", "collection"]],
    merge(
      existing: Connection = emptyConnection,
      incoming: Connection,
      { args }
    ): Connection {
      const page = args?.filters?.page ?? 1;
      if (page === 1) {
        return incoming;
      }

      const merged = existing.edges.slice(0);
      const ids = new Set<string>();
      for (const edge of incoming.edges) {
        const id = edge.node.id ?? edge.node.__ref.split(":")[1];
        if (!ids.has(id)) {
          ids.add(id);
          merged.push(edge);
        }
      }

      return {
        edges: merged,
        pageInfo: incoming.pageInfo,
      };
    },
  };
}

export function customTransactionConnectionPolicy(): FieldPolicy {
  const emptyConnection: Connection = {
    edges: [],
    pageInfo: {
      hasNextPage: true,
    },
  };

  return {
    keyArgs: ["filters", ["token"]],
    merge(
      existing: Connection = emptyConnection,
      incoming: Connection,
      { args }
    ): Connection {
      const offset = args?.filters?.offset ?? 0;
      if (offset === 0) {
        return incoming;
      }

      const merged = existing.edges.slice(0, offset + 1);
      const ids = new Set<string>();
      for (const edge of incoming.edges) {
        const id = edge.node.id ?? edge.node.__ref.split(":")[1];
        if (!ids.has(id)) {
          ids.add(id);
          merged.push(edge);
        }
      }

      return {
        edges: merged,
        pageInfo: incoming.pageInfo,
      };
    },
  };
}

export const cacheOnErrorApolloLinkHandler: RequestHandler = (
  operation,
  forward
) => {
  if (!forward) return null;

  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: observer.next.bind(observer),
      complete: observer.complete.bind(observer),
      error: (networkError) => {
        const cached = cache.readQuery<any>({
          query: operation.query,
          variables: operation.variables,
        });

        if (!cached) {
          observer.next({ data: undefined, errors: [networkError] });
        } else {
          observer.next({ data: cached });
        }
        observer.complete();
      },
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });
};
/**
 * Synchronously persist any cache wrapper and return a configured Apollo client instance.
 * @export
 * @param {Record<string, string>} [headers]
 * @returns {ApolloClient<NormalizedCacheObject>}
 */
export function createApolloClient(
  headers?: Record<string, string>
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: `${BACKEND_API_URL}/v2/graphql`,
    headers,
  });

  persistCacheSync({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });

  return new ApolloClient({
    cache,
    link: from([
      new ApolloLink(cacheOnErrorApolloLinkHandler),
      new RetryLink({
        delay: {
          initial: 500,
          max: Infinity,
          jitter: true,
        },
        attempts: {
          max: 10,
          retryIf: (error, _operation) => !!error,
        },
      }),
      httpLink,
    ]),
  });
}
