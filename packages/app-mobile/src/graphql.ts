// import Constants from "expo-constants";

import { ApolloClient, InMemoryCache } from "@apollo/client";

// const API_URL = Constants.manifest?.extra?.remoteGraphQLApi;
const API_URL = "https://backpack-api.xnfts.dev/v2/graphql";
export const apolloClient = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
});
