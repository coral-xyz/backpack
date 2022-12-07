import { useState } from "react";
import type {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
} from "@coral-xyz/common";
import { toTitleCase } from "@coral-xyz/common";
import { useAuthMessage } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import type Transport from "@ledgerhq/hw-transport";

import { useSteps } from "../../../hooks/useSteps";
import type { SelectedAccount } from "../../common/Account/ImportAccounts";
import { ImportAccounts } from "../../common/Account/ImportAccounts";
import { CloseButton } from "../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { ConnectHardwareSearching } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareWelcome } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";

import { HardwareDefaultAccount } from "./HardwareDefaultAccount";
import { HardwareSign } from "./HardwareSign";

export function HardwareOnboard({
  blockchain,
  action,
  onComplete,
  onClose,
}: {
  blockchain: Blockchain;
  action: "create" | "import";
  onComplete: (keyringInit: BlockchainKeyringInit) => void;
  onClose?: () => void;
}) {
  const authMessage = useAuthMessage();
  const theme = useCustomTheme();
  const { step, nextStep, prevStep } = useSteps();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [accounts, setAccounts] = useState<Array<SelectedAccount>>();
  const [derivationPath, setDerivationPath] = useState<DerivationPath>();

  // Component only allows onboarding of a singular selected account at this
  // time
  const account = accounts ? accounts[0] : undefined;

  //
  // Flow for onboarding a hardware wallet.
  //
  const steps = [
    <ConnectHardwareWelcome onNext={nextStep} />,
    <ConnectHardwareSearching
      blockchain={blockchain}
      onNext={(transport) => {
        setTransport(transport);
        nextStep();
      }}
      isConnectFailure={!!transportError}
    />,
    ...(action === "import"
      ? [
          <ImportAccounts
            blockchain={blockchain}
            transport={transport}
            allowMultiple={false}
            onNext={async (
              accounts: SelectedAccount[],
              derivationPath: DerivationPath
            ) => {
              setAccounts(accounts);
              setDerivationPath(derivationPath);
              nextStep();
            }}
            onError={() => {
              setTransportError(true);
              prevStep();
            }}
          />,
        ]
      : [
          // This is a create action, so use a component that just loads
          // and returns the default account
          <HardwareDefaultAccount
            blockchain={blockchain}
            transport={transport!}
            onNext={async (
              accounts: SelectedAccount[],
              derivationPath: DerivationPath
            ) => {
              setAccounts(accounts);
              setDerivationPath(derivationPath);
              nextStep();
            }}
            onError={() => {
              setTransportError(true);
              prevStep();
            }}
          />,
        ]),
    ...(account && derivationPath
      ? [
          <HardwareSign
            blockchain={blockchain}
            message={authMessage}
            publicKey={account!.publicKey}
            derivationPath={derivationPath}
            accountIndex={account!.index}
            text={`Sign the message to enable ${toTitleCase(
              blockchain
            )} in Backpack.`}
            onNext={(signature: string) => {
              onComplete({
                blockchain,
                publicKey: account.publicKey,
                derivationPath: derivationPath,
                accountIndex: account.index,
                signature,
              });
            }}
          />,
        ]
      : []),
  ];

  return (
    <WithNav
      navButtonLeft={
        step > 0 && step < steps.length - 1 ? (
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
      {steps[step]}
    </WithNav>
  );
}
