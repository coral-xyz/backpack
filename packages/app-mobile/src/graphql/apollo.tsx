// https://github.com/apollographql/apollo-cache-persist/tree/master/examples/react-native/src/hooks
import { useState, useEffect } from "react";

import Constants from "expo-constants";

import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistCache, AsyncStorageWrapper } from "apollo3-cache-persist";

const cache = new InMemoryCache();

const API_URL = Constants.expoConfig?.extra?.graphqlApiUrl;
const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = "Bearer abc1234";
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const useApolloClient = () => {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();

  useEffect(() => {
    async function init() {
      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });

      const apolloClient = new ApolloClient({
        cache,
        link: authLink.concat(httpLink),
      });

      setClient(apolloClient);
    }

    init();
  }, []);

  return {
    client,
  };
};
