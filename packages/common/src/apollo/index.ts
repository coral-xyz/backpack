import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";
import { LocalStorageWrapper, persistCacheSync } from "apollo3-cache-persist";

import { BACKEND_API_URL } from "../constants";

const cache = new InMemoryCache();
const httpLink = createHttpLink({
  uri: `${BACKEND_API_URL}/v2/graphql`,
});

/**
 * Synchronously persist any cache wrapper and return a configured Apollo client instance.
 * @export
 * @returns {ApolloClient<NormalizedCacheObject>}
 */
export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  persistCacheSync({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });

  return new ApolloClient({
    cache,
    link: httpLink,
  });
}
