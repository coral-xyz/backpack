import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import { Blockchain, DerivationPath } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { ConnectHardwareWelcome } from "./ConnectHardwareWelcome";
import { ConnectHardwareSearching } from "./ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";
import { ImportAccounts } from "../../../../common/Account/ImportAccounts";
import type { SelectedAccount } from "../../../../common/Account/ImportAccounts";
import { WithNav, NavBackButton } from "../../../../common/Layout/Nav";

export function ConnectHardware({
  blockchain,
  onImport,
  onComplete,
}: {
  blockchain: Blockchain;
  onImport?: (
    accounts: SelectedAccount[],
    derivationPath: DerivationPath
  ) => Promise<void>;
  onComplete: () => void;
}) {
  const theme = useCustomTheme();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
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
        if (onImport) {
          await onImport(accounts, derivationPath);
        }
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
        height: "400px",
      }}
    >
      {connectHardwareFlow[step]}
    </WithNav>
  );
}
