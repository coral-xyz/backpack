import { useEffect, useState } from "react";

import Constants from "expo-constants";

import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
// https://github.com/apollographql/apollo-cache-persist/tree/master/examples/react-native/src/hooks
import { AsyncStorageWrapper, persistCache } from "apollo3-cache-persist";

import { useSession } from "~lib/SessionProvider";
// consider using react-native-mmk when the time comes for the persisted cache
// much faster than AsyncStorage

const cache = new InMemoryCache();
const API_URL = Constants.expoConfig?.extra?.graphqlApiUrl;

const makeApolloClient = (token: string | null) => {
  const httpLink = createHttpLink({
    uri: API_URL,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const client = new ApolloClient({
    cache,
    link: authLink.concat(httpLink),
  });

  return client;
};

export const useApolloClient = () => {
  const { token } = useSession();
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();

  useEffect(() => {
    async function init(token: string | null) {
      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });

      const apolloClient = makeApolloClient(token);
      setClient(apolloClient);
    }

    init(token);
  }, [token]);

  return {
    client,
  };
};
