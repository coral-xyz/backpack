import { Suspense } from "react";
import { ApolloProvider } from "@apollo/client";
import { BACKPACK_CONFIG_VERSION, createApolloClient } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useApolloClientHeaders, useBootstrapFast } from "@coral-xyz/recoil";
import {
  QueryClient as ReactQueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";

import { Router } from "../common/Layout/Router";

const reactQueryClient = new ReactQueryClient();

export function Unlocked() {
  return (
    <Suspense fallback={<Loading />}>
      <Bootstrap />
      <WithApollo>
        <ReactQueryClientProvider client={reactQueryClient}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Router />
          </div>
        </ReactQueryClientProvider>
      </WithApollo>
    </Suspense>
  );
}

function Bootstrap() {
  useBootstrapFast();
  return null;
}

function WithApollo({ children }: { children: any }) {
  const headers = useApolloClientHeaders();
  const apolloClient = createApolloClient(
    "backpack-extension",
    BACKPACK_CONFIG_VERSION,
    headers
  );
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
