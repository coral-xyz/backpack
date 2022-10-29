import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { HardwareSign } from "./HardwareSign";
import { HardwareDefaultAccount } from "./HardwareDefaultAccount";
import { ConnectHardwareWelcome } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";
import { ConnectHardwareSearching } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSuccess";
import { ImportAccounts } from "../../common/Account/ImportAccounts";
import type { SelectedAccount } from "../../common/Account/ImportAccounts";
import { WithNav, NavBackButton } from "../../common/Layout/Nav";
import { CloseButton } from "../../common/Layout/Drawer";
import { useSteps } from "../../../hooks/useSteps";

export function HardwareOnboard({
  blockchain,
  action,
  inviteCode,
  onComplete,
  onClose,
  requireSignature = true,
}: {
  blockchain: Blockchain;
  action: "create" | "import";
  onComplete: (keyringInit: BlockchainKeyringInit) => void;
  inviteCode?: string;
  requireSignature?: boolean;
  onClose?: () => void;
}) {
  const theme = useCustomTheme();
  const { step, nextStep, prevStep } = useSteps();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [accounts, setAccounts] = useState<Array<SelectedAccount>>();
  const [derivationPath, setDerivationPath] = useState<DerivationPath>();

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
              if (requireSignature) {
                setAccounts(accounts);
                setDerivationPath(derivationPath);
                nextStep();
              } else {
                onComplete({
                  blockchain,
                  derivationPath: derivationPath!,
                  accountIndex: accounts![0].index,
                  publicKey: accounts![0].publicKey,
                  signature: null,
                });
              }
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
              if (requireSignature) {
                setAccounts(accounts);
                setDerivationPath(derivationPath);
                nextStep();
              } else {
                onComplete({
                  blockchain,
                  derivationPath: derivationPath!,
                  accountIndex: accounts![0].index,
                  publicKey: accounts![0].publicKey,
                  signature: null,
                });
              }
            }}
            onError={() => {
              setTransportError(true);
              prevStep();
            }}
          />,
        ]),
    // Prompting for a signature is optional in the component
    ...(requireSignature
      ? [
          <HardwareSign
            blockchain={blockchain}
            inviteCode={inviteCode ? inviteCode : ""}
            accounts={accounts ? accounts : []}
            derivationPath={derivationPath}
            onNext={(signature: string) => {
              onComplete({
                blockchain,
                derivationPath: derivationPath!,
                accountIndex: accounts![0].index,
                publicKey: accounts![0].publicKey,
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
