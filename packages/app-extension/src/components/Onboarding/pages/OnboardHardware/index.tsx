import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import { Blockchain, DerivationPath } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { ConnectHardwareWelcome } from "../../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";
import { ConnectHardwareSearching } from "../../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "../../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSuccess";
import { ImportAccounts } from "../../../common/Account/ImportAccounts";
import type { SelectedAccount } from "../../../common/Account/ImportAccounts";
import { WithNav, NavBackButton } from "../../../common/Layout/Nav";
import { CloseButton } from "../../../common/Layout/Drawer";
import { SignOnboardHardware } from "./SignOnboardHardware";
import { useSteps } from "../../../../hooks/useSteps";

export function OnboardHardware({
  blockchain,
  onComplete,
  onClose,
}: {
  blockchain: Blockchain;
  onComplete: () => void;
  onClose?: () => void;
}) {
  const theme = useCustomTheme();
  const { step, setStep, nextStep, prevStep } = useSteps();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [accounts, setAccounts] = useState<Array<SelectedAccount>>();
  const [derivationPath, setDerivationPath] = useState<DerivationPath>();

  //
  // Flow for onboarding a hardware wallet.
  //
  const steps = [
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
        setAccounts(accounts);
        setDerivationPath(derivationPath);
        nextStep();
      }}
      onError={() => {
        setTransportError(true);
        prevStep();
      }}
    />,
    <SignOnboardHardware
      blockchain={blockchain}
      accounts={accounts ? accounts : []}
      derivationPath={derivationPath}
      onNext={(signature) => {
        nextStep();
      }}
    />,
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
