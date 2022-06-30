import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { ResetWelcome } from "./ResetWelcome";
import { ResetWarning } from "./ResetWarning";
import { SetupComplete } from "../../Account/SetupComplete";
import { MnemonicInput } from "../../Account/MnemonicInput";
import { ImportAccounts } from "../../Account/ImportAccounts";
import { CreatePassword } from "../../Account/CreatePassword";
import { WithNav, NavBackButton } from "../../Layout/Nav";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";

export function Reset({
  onBack,
  closeDrawer,
}: {
  onBack: () => void;
  closeDrawer: () => void;
}) {
  const theme = useCustomTheme();
  const [mnemonic, setMnemonic] = useState("");
  const [derivationPath, setDerivationPath] = useState<DerivationPath>();
  const [accountIndices, setAccountIndices] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const createStore = async (
    mnemonic: string,
    // TODO
    derivationPath: DerivationPath | undefined,
    password: string,
    accountIndices: number[]
  ) => {
    const background = getBackgroundClient();
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
      params: [mnemonic, derivationPath, password, accountIndices],
    });
  };

  const renderComponent =
    [
      <ResetWelcome onNext={nextStep} onClose={closeDrawer} />,
      <ResetWarning onNext={nextStep} onClose={closeDrawer} />,
      <MnemonicInput
        onNext={(mnemonic: string) => {
          setMnemonic(mnemonic);
          nextStep();
        }}
      />,
      <ImportAccounts
        mnemonic={mnemonic}
        onNext={(accountIndices: number[], derivationPath: DerivationPath) => {
          setAccountIndices(accountIndices);
          setDerivationPath(derivationPath);
          nextStep();
        }}
      />,
      <CreatePassword
        onNext={(password: string) => {
          createStore(mnemonic, derivationPath, password, accountIndices);
          nextStep();
        }}
      />,
      <SetupComplete onClose={closeDrawer} />,
    ][step] || null;

  return (
    <WithNav
      navButtonLeft={<NavBackButton onClick={prevStep} />}
      navbarStyle={{
        backgroundColor: theme.custom.colors.nav,
      }}
      navContentStyle={{
        backgroundColor: theme.custom.colors.nav,
      }}
    >
      {renderComponent}
    </WithNav>
  );
}
