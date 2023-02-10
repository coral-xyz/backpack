import { useBootstrapFast } from "@coral-xyz/recoil";

import { NotchBackground,WithNotchCutout } from "../common/Layout/Notch";
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
        <NotchBackground />
        <WithNotchCutout>
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
        </WithNotchCutout>
      </WalletDrawerProvider>
    </WithVersion>
  );
}
