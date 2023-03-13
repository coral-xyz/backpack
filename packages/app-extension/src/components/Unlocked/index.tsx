import { useBootstrapFast } from "@coral-xyz/recoil";

import { Spotlight } from "../../spotlight/Spotlight";
import { Router } from "../common/Layout/Router";
import { WithTabs } from "../common/Layout/Tab";
import { WalletDrawerProvider } from "../common/WalletList";

import { ApproveTransactionRequest } from "./ApproveTransactionRequest";
import { PrimaryPubkeySelector } from "./PrimaryPubkeySelector";
import { WithVersion } from "./WithVersion";

//
// The main nav persistent stack.
//
export function Unlocked() {
  useBootstrapFast();

  return (
    <WithVersion>
      <WalletDrawerProvider>
        <Spotlight />
        <WithTabs>
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
        </WithTabs>
      </WalletDrawerProvider>
    </WithVersion>
  );
}
