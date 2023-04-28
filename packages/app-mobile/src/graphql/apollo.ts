import Constants from "expo-constants";

import { ApolloClient, InMemoryCache } from "@apollo/client";
const API_URL = Constants.expoConfig?.extra?.graphqlApiUrl;
export const apolloClient = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
});
