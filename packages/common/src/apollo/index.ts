import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { LocalStorageWrapper, persistCacheSync } from "apollo3-cache-persist";

import { BACKEND_API_URL } from "../constants";

const cache = new InMemoryCache();

/**
 * Synchronously persist any cache wrapper and return a configured Apollo client instance.
 * @export
 * @param {string} jwt
 * @returns {ApolloClient<NormalizedCacheObject>}
 */
export function createApolloClient(
  jwt: string
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: `${BACKEND_API_URL}/v2/graphql`,
  });

  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${jwt}`,
      },
    };
  });

  persistCacheSync({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });

  return new ApolloClient({
    cache,
    link: from([authLink, httpLink]),
  });
}
