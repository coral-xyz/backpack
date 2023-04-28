import type { FetchFunction, IEnvironment } from "relay-runtime";

import Constants from "expo-constants";

import {
  Store,
  RecordSource,
  Environment,
  Network,
  Observable,
} from "relay-runtime";

const API_URL = Constants.expoConfig?.extra?.graphqlApiUrl;

const fetchFn: FetchFunction = (params, variables) => {
  const response = fetch(API_URL, {
    method: "POST",
    headers: [["Content-Type", "application/json"]],
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  return Observable.from(response.then((data) => data.json()));
};

export function createEnvironment(): IEnvironment {
  const network = Network.create(fetchFn);
  const store = new Store(new RecordSource());
  return new Environment({ store, network });
}
