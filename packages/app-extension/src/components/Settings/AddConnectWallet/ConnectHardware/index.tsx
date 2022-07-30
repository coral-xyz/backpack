import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import { DerivationPath, UI_RPC_METHOD_LEDGER_IMPORT } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ConnectHardwareWelcome } from "./ConnectHardwareWelcome";
import { ConnectHardwareSearching } from "./ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";
import { ImportAccounts } from "../../../Account/ImportAccounts";
import type { SelectedAccount } from "../../../Account/ImportAccounts";
import { OptionsContainer } from "../../../Onboarding";
import { WithNav, NavBackButton } from "../../../Layout/Nav";

export function ConnectHardware({ onComplete }: { onComplete: () => void }) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  //
  // Add one or more pubkeys to the Ledger store.
  //
  const ledgerImport = async (
    accounts: SelectedAccount[],
    derivationPath: DerivationPath
  ) => {
    for (const account of accounts) {
      await background.request({
        method: UI_RPC_METHOD_LEDGER_IMPORT,
        params: [derivationPath, account.index, account.publicKey.toString()],
      });
    }
  };

  //
  // Flow for importing a hardware wallet.
  //
  const connectHardwareFlow = [
    <ConnectHardwareWelcome onNext={() => nextStep()} />,
    <ConnectHardwareSearching
      onNext={(transport) => {
        setTransport(transport);
        nextStep();
      }}
      isConnectFailure={!!transportError}
    />,
    <ImportAccounts
      transport={transport}
      onNext={async (
        accounts: SelectedAccount[],
        derivationPath: DerivationPath
      ) => {
        await ledgerImport(accounts, derivationPath);
        nextStep();
      }}
      onError={() => {
        setTransportError(true);
        prevStep();
      }}
    />,
    <ConnectHardwareSuccess onNext={onComplete} />,
  ];

  return (
    <OptionsContainer>
      <WithNav
        navButtonLeft={
          step > 0 && step < connectHardwareFlow.length - 1 ? (
            <NavBackButton onClick={prevStep} />
          ) : null
        }
        navbarStyle={{
          backgroundColor: theme.custom.colors.nav,
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.nav,
          height: "100%",
        }}
      >
        {connectHardwareFlow[step]}
      </WithNav>
    </OptionsContainer>
  );
}
