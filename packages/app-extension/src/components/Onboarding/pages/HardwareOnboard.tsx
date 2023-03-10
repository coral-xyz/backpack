import { useState } from "react";
import type {
  Blockchain,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import type Transport from "@ledgerhq/hw-transport";

import { useSteps } from "../../../hooks/useSteps";
import { ImportWallets } from "../../common/Account/ImportWallets";
import { CloseButton } from "../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { ConnectHardwareSearching } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareWelcome } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";

import { HardwareDefaultWallet } from "./HardwareDefaultWallet";
import { HardwareDeriveWallet } from "./HardwareDeriveWallet";
import { HardwareSearchWallet } from "./HardwareSearchWallet";
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
  action: "create" | "derive" | "search" | "import";
  searchPublicKey?: string;
  signMessage: string | ((publicKey: string) => string);
  signText: string;
  successComponent?: React.ReactElement;
  onComplete: (signedWalletDescriptor: SignedWalletDescriptor) => void;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [walletDescriptor, setWalletDescriptor] =
    useState<WalletDescriptor | null>(null);

  //
  // Flow for onboarding a hardware wallet.
  //
  const steps = [
    <ConnectHardwareWelcome key="ConnectHardwareWelcome" onNext={nextStep} />,
    <ConnectHardwareSearching
      key="ConnectHardwareSearching"
      blockchain={blockchain}
      onNext={(transport) => {
        setTransport(transport);
        nextStep();
      }}
      isConnectFailure={!!transportError}
    />,
    //
    // Use a component to get a wallet to proceed with. The create flow uses a
    // component that gets a default wallet on an unused account index, the search
    // flow searches a hardware wallet for a given public key, and the import flow
    // allows the user to select a wallet.
    //
    {
      // The "create" flow uses a component that finds an unused account index for
      // creating a new account. This step automatically proceeds to the next step
      // and and there is no user input required.
      create: (
        <HardwareDefaultWallet
          blockchain={blockchain}
          transport={transport!}
          onNext={(walletDescriptor: WalletDescriptor) => {
            setWalletDescriptor(walletDescriptor);
            nextStep();
          }}
          onError={() => {
            setTransportError(true);
            prevStep();
          }}
        />
      ),
      derive: (
        // Derive the next wallet that an account should use.
        <HardwareDeriveWallet
          blockchain={blockchain}
          transport={transport!}
          onNext={(walletDescriptor: WalletDescriptor) => {
            setWalletDescriptor(walletDescriptor);
            nextStep();
          }}
          onError={() => {
            setTransportError(true);
            prevStep();
          }}
        />
      ),
      // The search flow searches the wallet for a given public key to proceed
      // with.
      search: (
        <HardwareSearchWallet
          blockchain={blockchain!}
          transport={transport!}
          publicKey={searchPublicKey!}
          onNext={(walletDescriptor: WalletDescriptor) => {
            setWalletDescriptor(walletDescriptor);
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
      // key to proceed with. This component works with either a mnemonic or a
      // hardware wallet.
      import: (
        <ImportWallets
          blockchain={blockchain}
          transport={transport!}
          allowMultiple={false} // Only allow a single wallet to be selected
          onNext={(walletDescriptors: Array<WalletDescriptor>) => {
            setWalletDescriptor(walletDescriptors[0]);
            nextStep();
          }}
          onError={() => {
            setTransportError(true);
            prevStep();
          }}
        />
      ),
    }[action],
    ...(walletDescriptor
      ? [
          // Sign the found wallet descriptor for API submit
        <HardwareSign
          key="HardwareSign"
          blockchain={blockchain}
          walletDescriptor={walletDescriptor}
          message={
              typeof signMessage === "string"
                ? signMessage
                : signMessage(walletDescriptor.publicKey)
            }
          text={signText}
          onNext={(signature: string) => {
              onComplete({
                ...walletDescriptor,
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

  // Optional component displayed on success of hardware onboarding
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
  action: "create" | "derive" | "search" | "import";
  searchPublicKey?: string;
  signMessage: string | ((publicKey: string) => string);
  signText: string;
  successComponent?: React.ReactElement;
  onComplete: (signedWalletDescriptor: SignedWalletDescriptor) => void;
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
