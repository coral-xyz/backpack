import { useState } from "react";
import { Box } from "@mui/material";
import { ResetWelcome } from "./ResetWelcome";
import { ResetWarning } from "./ResetWarning";
import { MnemonicInput } from "./MnemonicInput";
import { SetupComplete } from "./SetupComplete";
import { ImportAccounts } from "../../ImportAccounts";
import { CreatePassword } from "../../Account/CreatePassword";
import { NAV_BAR_HEIGHT, _NavBackButton } from "../../Layout/Nav";
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
    {
      0: <ResetWelcome onNext={nextStep} onClose={closeDrawer} />,
      1: <ResetWarning onNext={nextStep} onClose={closeDrawer} />,
      2: (
        <MnemonicInput
          onNext={(mnemonic: string) => {
            setMnemonic(mnemonic);
            nextStep();
          }}
        />
      ),
      3: (
        <ImportAccounts
          mnemonic={mnemonic}
          onNext={(
            accountIndices: number[],
            derivationPath: DerivationPath
          ) => {
            setAccountIndices(accountIndices);
            setDerivationPath(derivationPath);
            nextStep();
          }}
        />
      ),
      4: (
        <CreatePassword
          onNext={(password: string) => {
            createStore(mnemonic, derivationPath, password, accountIndices);
            nextStep();
          }}
        />
      ),
      5: <SetupComplete onClose={closeDrawer} />,
    }[step] || null;

  return (
    <Box sx={{ height: "100%" }}>
      <Box
        sx={{
          height: `${NAV_BAR_HEIGHT}px`,
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 16px",
        }}
      >
        <_NavBackButton onBack={prevStep} />
      </Box>
      {renderComponent}
    </Box>
  );
}
