import { ApolloProvider, SuspenseCache } from "@apollo/client";
import { createApolloClient } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useAuthenticatedUser, useBootstrapFast } from "@coral-xyz/recoil";

import { Spotlight } from "../../spotlight/Spotlight";
import { Router } from "../common/Layout/Router";
import { WithTabBarBottom } from "../common/Layout/Tab";
import { WalletDrawerProvider } from "../common/WalletList";

import { ApproveTransactionRequest } from "./ApproveTransactionRequest";
import { PrimaryPubkeySelector } from "./PrimaryPubkeySelector";
import { WithVersion } from "./WithVersion";

const suspenseCache = new SuspenseCache();

//
// The main nav persistent stack.
//
export function Unlocked() {
  useBootstrapFast();
  const user = useAuthenticatedUser();
  if (!user) {
    return <Loading />;
  }

  const apolloClient = createApolloClient(user.jwt);

  return (
    <ApolloProvider client={apolloClient} suspenseCache={suspenseCache}>
      <WithVersion>
        <WalletDrawerProvider>
          <Spotlight />
          <WithTabBarBottom>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Router />
              <ApproveTransactionRequest />
              <PrimaryPubkeySelector />
            </div>
          </WithTabBarBottom>
        </WalletDrawerProvider>
      </WithVersion>
    </ApolloProvider>
  );
}
