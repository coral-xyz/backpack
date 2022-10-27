import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import {
  Blockchain,
  DerivationPath,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ConnectHardwareWelcome } from "./ConnectHardwareWelcome";
import { ConnectHardwareSearching } from "./ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";
import { ImportAccounts } from "../../../../common/Account/ImportAccounts";
import type { SelectedAccount } from "../../../../common/Account/ImportAccounts";
import { WithNav, NavBackButton } from "../../../../common/Layout/Nav";
import { CloseButton } from "../../../../common/Layout/Drawer";
import { OptionsContainer } from "../../../../Onboarding";

export function ConnectHardware({
  blockchain,
  onComplete,
  onClose,
}: {
  blockchain: Blockchain;
  onComplete: () => void;
  onClose?: () => void;
}) {
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
        params: [
          blockchain,
          derivationPath,
          account.index,
          account.publicKey.toString(),
        ],
      });
    }

    //
    // Automatically switch to the first wallet in the import list.
    //
    if (accounts.length > 0) {
      const active = accounts[0].publicKey.toString();
      await background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [active, blockchain],
      });
    }
  };

  //
  // Flow for importing a hardware wallet.
  //
  const connectHardwareFlow = [
    <ConnectHardwareWelcome onNext={() => nextStep()} />,
    <ConnectHardwareSearching
      blockchain={blockchain}
      onNext={(transport) => {
        setTransport(transport);
        nextStep();
      }}
      isConnectFailure={!!transportError}
    />,
    <ImportAccounts
      blockchain={blockchain}
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
          ) : onClose ? (
            <CloseButton onClick={onClose} />
          ) : null
        }
        navbarStyle={{
          backgroundColor: theme.custom.colors.nav,
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.nav,
          height: "400px",
        }}
      >
        {connectHardwareFlow[step]}
      </WithNav>
    </OptionsContainer>
  );
}
