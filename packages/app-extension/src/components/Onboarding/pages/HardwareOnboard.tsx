import { useState } from "react";
import type {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
} from "@coral-xyz/common";
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
import { HardwareSearch } from "./HardwareSearch";
import { HardwareSign } from "./HardwareSign";

export function HardwareOnboard({
  blockchain,
  action,
  searchPublicKey,
  signMessage,
  signText,
  onComplete,
  onClose,
}: {
  blockchain: Blockchain;
  action: "create" | "search" | "import";
  searchPublicKey?: string;
  signMessage: string | ((publicKey: string) => string);
  signText: string;
  onComplete: (keyringInit: BlockchainKeyringInit) => void;
  onClose?: () => void;
}) {
  const theme = useCustomTheme();
  const { step, nextStep, prevStep } = useSteps();

  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [accounts, setAccounts] = useState<Array<SelectedAccount>>();
  const [derivationPath, setDerivationPath] = useState<DerivationPath>();

  // Component only allows onboarding of a singular selected account at this
  // time, the signing prompt needs to be reworked to handle multiple accounts
  // and handle failures to sign (or optional skipping the signatures) to allow
  // this component to handle multiple accounts
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
    //
    // Use one of multiple components to get a wallet to proceed with
    //
    {
      // The "create" flow uses a component that selects the first found public
      // key. This step auto-proceeds and there is no user intervention
      create: (
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
        />
      ),
      // The search flow searches the wallet for a given public key to proceed
      // with
      search: (
        <HardwareSearch
          blockchain={blockchain!}
          transport={transport!}
          publicKey={searchPublicKey!}
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
          onRetry={prevStep}
        />
      ),
      // The import flow displays a table and allows the user to select a public
      // key to proceed with
      import: (
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
        />
      ),
    }[action],
    ...(account && derivationPath
      ? [
          <HardwareSign
            blockchain={blockchain}
            message={
              typeof signMessage === "string"
                ? signMessage
                : signMessage(account!.publicKey)
            }
            publicKey={account!.publicKey}
            derivationPath={derivationPath}
            accountIndex={account!.index}
            text={signText}
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
