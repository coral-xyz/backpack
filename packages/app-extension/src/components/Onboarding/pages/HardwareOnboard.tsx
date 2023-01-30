import { useState } from "react";
import type {
  Blockchain,
  PublicKeyPath,
  SignedPublicKeyPath,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import type Transport from "@ledgerhq/hw-transport";

import { useSteps } from "../../../hooks/useSteps";
import { ImportAccounts } from "../../common/Account/ImportAccounts";
import { CloseButton } from "../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { ConnectHardwareSearching } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareWelcome } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";

import { HardwareDefaultAccount } from "./HardwareDefaultAccount";
import { HardwareSearch } from "./HardwareSearch";
import { HardwareSign } from "./HardwareSign";

// We are using a hook here to generate the steps for the hardware onboard
// component to allow these steps to be used in the middle of the RecoverAccount
// component steps
export function useHardwareOnboardSteps({
  blockchain,
  action,
  searchPublicKey,
  signMessage,
  signText,
  successComponent,
  onComplete,
  nextStep,
  prevStep,
}: {
  blockchain: Blockchain;
  action: "create" | "search" | "import";
  searchPublicKey?: string;
  signMessage: string | ((publicKey: string) => string);
  signText: string;
  successComponent?: React.ReactElement;
  onComplete: (signedPublicKeyPath: SignedPublicKeyPath) => void;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [publicKeyPath, setPublicKeyPath] = useState<PublicKeyPath | null>(
    null
  );

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
    // Use a component to get a wallet to proceed with. The create flow uses a
    // component that gets a default account, the search flow searches a
    // hardware wallet for a given public key, and the import flow allows the
    // user to select a wallet.
    //
    {
      // The "create" flow uses a component that selects the first found public
      // key. This step automatically proceeds to the next step and and there is
      // no user input required.
      create: (
        <HardwareDefaultAccount
          blockchain={blockchain}
          transport={transport!}
          onNext={(publicKeyPath: PublicKeyPath) => {
            setPublicKeyPath(publicKeyPath);
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
          onNext={(publicKeyPath: PublicKeyPath) => {
            setPublicKeyPath(publicKeyPath);
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
          onNext={(publicKeyPaths: Array<PublicKeyPath>) => {
            setPublicKeyPath(publicKeyPaths[0]);
            nextStep();
          }}
          onError={() => {
            setTransportError(true);
            prevStep();
          }}
        />
      ),
    }[action],
    ...(publicKeyPath
      ? [
          <HardwareSign
            blockchain={blockchain}
            publicKeyPath={publicKeyPath}
            message={
              typeof signMessage === "string"
                ? signMessage
                : signMessage(publicKeyPath.publicKey)
            }
            text={signText}
            onNext={(signature: string) => {
              onComplete({
                ...publicKeyPath,
                signature,
              });
              if (successComponent) {
                nextStep();
              }
            }}
          />,
        ]
      : []),
  ];

  if (successComponent) {
    steps.push(successComponent);
  }

  return steps;
}

export function HardwareOnboard({
  blockchain,
  action,
  searchPublicKey,
  signMessage,
  signText,
  successComponent,
  onComplete,
  onClose,
}: {
  blockchain: Blockchain;
  action: "create" | "search" | "import";
  searchPublicKey?: string;
  signMessage: string | ((publicKey: string) => string);
  signText: string;
  successComponent?: React.ReactElement;
  onComplete: (signedPublicKeyPath: SignedPublicKeyPath) => void;
  onClose?: () => void;
}) {
  const theme = useCustomTheme();
  const { step, nextStep, prevStep } = useSteps();
  const steps = useHardwareOnboardSteps({
    blockchain,
    action,
    searchPublicKey,
    signMessage,
    signText,
    successComponent,
    onComplete,
    nextStep,
    prevStep,
  });
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
