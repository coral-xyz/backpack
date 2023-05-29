import type { FetchFunction, IEnvironment } from "relay-runtime";

import { EnvironmentKey } from "recoil-relay";
import {
  Store,
  RecordSource,
  Environment,
  Network,
  Observable,
} from "relay-runtime";

export const RelayEnvironmentKey = new EnvironmentKey("Relay Environment");

const API_URL = "https://backpack-api.xnfts.dev/v2/graphql";

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
