import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  Blockchain,
  BrowserRuntimeExtension,
  DerivationPath,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { CreatePassword } from "../common/Account/CreatePassword";
import { MnemonicInput } from "../common/Account/MnemonicInput";
import { SetupComplete } from "../common/Account/SetupComplete";
import { ImportAccounts } from "../common/Account/ImportAccounts";
import type { SelectedAccount } from "../common/Account/ImportAccounts";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { WithNav, NavBackButton } from "../common/Layout/Nav";
import { getWaitlistId } from "./WaitingRoom";

export type OnboardingFlows =
  | {
      username?: string;
      inviteCode?: string;
      flow: "create-wallet" | "import-wallet";
    }
  | undefined;

export function Onboarding() {
  const [mnemonic, setMnemonic] = useState("");
  const [derivationPath, setDerivationPath] = useState<DerivationPath>();
  const [password, setPassword] = useState<string>("");
  const [accounts, setAccounts] = useState<SelectedAccount[]>([]);
  const [step, setStep] = useState(0);
  const [onboardingVars, setOnboardingVars] = useState<OnboardingFlows>();

  const background = useBackgroundClient();

  const createStore = async (
    mnemonic: string,
    derivationPath: DerivationPath | undefined,
    password: string,
    accountIndices: number[]
  ) => {
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [
          mnemonic,
          derivationPath,
          password,
          accountIndices,
          onboardingVars?.username,
          onboardingVars?.inviteCode,
          getWaitlistId?.(),
        ],
      });
    } catch (err) {
      console.error(err);
      if (
        confirm("There was an issue setting up your account. Please try again.")
      ) {
        window.location.reload();
      }
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 0) {
      // If we are at the first step, back should revert to welcome screen
      setOnboardingVars(undefined);
    } else {
      setStep(step - 1);
    }
  };

  //
  // Flow for creating a new wallet. This generates a random 12 word mnemonic
  // and sets a password.
  //
  const createWalletFlow = [
    <CreatePassword
      onNext={(password: string) => {
        setPassword(password);
        nextStep();
      }}
    />,
    <MnemonicInput
      buttonLabel="Next"
      onNext={async (mnemonic: string) => {
        await createStore(mnemonic, DerivationPath.Bip44, password, [0]);
        nextStep();
      }}
      readOnly={true}
    />,
    <SetupComplete onClose={() => BrowserRuntimeExtension.closeActiveTab()} />,
  ];

  //
  // Flow for importing an existing mnemonic. The user can input a 12 or
  // 24 word mnemonic and select the accounts they want to import, as well
  // as set a password.
  //
  const importWalletFlow = [
    <MnemonicInput
      buttonLabel="Import"
      onNext={(mnemonic: string) => {
        setMnemonic(mnemonic);
        nextStep();
      }}
    />,
    <ImportAccounts
      blockchain={Blockchain.SOLANA}
      mnemonic={mnemonic}
      onNext={(accounts: SelectedAccount[], derivationPath: DerivationPath) => {
        setAccounts(accounts);
        setDerivationPath(derivationPath);
        nextStep();
      }}
    />,
    <CreatePassword
      onNext={async (password: string) => {
        const accountIndices = accounts.map((account) => account.index);
        await createStore(mnemonic, derivationPath, password, accountIndices);
        nextStep();
      }}
    />,
    <SetupComplete onClose={() => BrowserRuntimeExtension.closeActiveTab()} />,
  ];

  let renderComponent;
  if (!onboardingVars) {
    renderComponent = <OnboardingWelcome onSelect={setOnboardingVars} />;
  } else {
    const flow = {
      "create-wallet": createWalletFlow,
      "import-wallet": importWalletFlow,
    }[onboardingVars.flow];
    renderComponent = (
      <WithNav
        navButtonLeft={
          step < flow.length - 1 && <NavBackButton onClick={prevStep} />
        }
        navbarStyle={{
          borderRadius: "12px",
        }}
        navContentStyle={{
          borderRadius: "12px",
        }}
      >
        {flow[step] || null}
      </WithNav>
    );
  }

  return <OptionsContainer>{renderComponent}</OptionsContainer>;
}

export function OptionsContainer({ children }: { children: React.ReactNode }) {
  const theme = useCustomTheme();
  return (
    <div style={{ backgroundColor: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
          background: `
            radial-gradient(farthest-side at 0 0, #6360FF, rgba(255,255,255,0) 100%), 
            radial-gradient(farthest-side at 100% 0, #C061F7, rgba(255,255,255,0) 100%), 
            radial-gradient(farthest-side at 0 100%, #28DBD1 25%, rgba(255,255,255,0) 100%),
            radial-gradient(farthest-side at 100% 100%, #FE6F5C 25%, rgba(255,255,255,0) 100%)`,
        }}
      >
        <div
          style={{
            width: `${EXTENSION_WIDTH}px`,
            height: `${EXTENSION_HEIGHT}px`,
            display: "flex",
            flexDirection: "column",
            margin: "0 auto",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
            background: theme.custom.colors.backgroundBackdrop,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
