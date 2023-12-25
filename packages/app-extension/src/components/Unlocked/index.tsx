import { Suspense } from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useApolloClientHeaders, useBootstrapFast } from "@coral-xyz/recoil";

import { Spotlight } from "../../spotlight/Spotlight";
import { Router } from "../common/Layout/Router";
import { WalletDrawerProvider } from "../common/WalletList";

//
// The main nav persistent stack.
//
export function Unlocked() {
  return (
    <Suspense fallback={<Loading />}>
      <Bootstrap />
      <WalletDrawerProvider>
        <WithApollo>
          <Spotlight />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Router />
          </div>
        </WithApollo>
      </WalletDrawerProvider>
    </Suspense>
  );
}

function Bootstrap() {
  useBootstrapFast();
  return null;
}

function WithApollo({ children }: { children: any }) {
  const headers = useApolloClientHeaders();
  const apolloClient = createApolloClient(headers);
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
