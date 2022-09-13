import {
  Blockchain,
  BrowserRuntimeExtension,
  DerivationPath,
  EXTENSION_HEIGHT,
  EXTENSION_WIDTH,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";

import { useBackgroundClient } from "@coral-xyz/recoil";
import { useState } from "react";
import { CreatePassword } from "../common/Account/CreatePassword";
import {
  ImportAccounts,
  SelectedAccount,
} from "../common/Account/ImportAccounts";
import { MnemonicInput } from "../common/Account/MnemonicInput";
import { SetupComplete } from "../common/Account/SetupComplete";
import { NavBackButton, WithNav } from "../common/Layout/Nav";
import { InviteCode } from "./InviteCode";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { LoginAsExistingUser } from "../common/Account/LoginAsExistingUser";

export type OnboardingFlows = "create-wallet" | "import-wallet" | null;

export function Onboarding() {
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [step, setStep] = useState(0);
  const [onboardingFlow, setOnboardingFlow] = useState<OnboardingFlows>(null);
  const theme = useCustomTheme();
  const background = useBackgroundClient();

  const createStore = async (
    mnemonic: string,
    // TODO
    derivationPath: DerivationPath | undefined,
    username: string,
    password: string,
    accountIndices: number[]
  ) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
      params: [mnemonic, derivationPath, username, password, accountIndices],
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 0) {
      // If we are at the first step, back should revert to welcome screen
      setOnboardingFlow(null);
    } else {
      setStep(step - 1);
    }
  };

  //
  // Flow for creating a new wallet. This generates a random 12 word mnemonic
  // and sets a password.
  //
  const createWalletFlow = [
    <MnemonicInput
      buttonLabel="Next"
      onNext={(mnemonic: string) => {
        createStore(mnemonic, DerivationPath.Bip44Change, username, password, [
          0,
        ]);
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
        // setAccounts(accounts);
        // setDerivationPath(derivationPath);
        const accountIndices = accounts.map((account) => account.index);
        createStore(
          mnemonic,
          derivationPath,
          username,
          password,
          accountIndices
        );

        nextStep();
      }}
    />,
    <SetupComplete onClose={() => BrowserRuntimeExtension.closeActiveTab()} />,
  ];

  let renderComponent;
  if (onboardingFlow === null) {
    if (inviteCode || username) {
      if (username) {
        renderComponent = <OnboardingWelcome onSelect={setOnboardingFlow} />;
      } else {
        renderComponent = (
          <CreatePassword
            inviteCode={inviteCode}
            onNext={(username: string, password: string) => {
              setUsername(username);
              setPassword(password);
            }}
          />
        );
      }
    } else {
      if (isExistingUser) {
        renderComponent = (
          <LoginAsExistingUser
            onNext={(username: string, password: string) => {
              setUsername(username);
              setPassword(password);
            }}
            showInviteCodeFlow={() => setIsExistingUser(false)}
          />
        );
      } else {
        renderComponent = (
          <InviteCode
            onNext={setInviteCode}
            showExistingUserFlow={() => setIsExistingUser(true)}
          />
        );
      }
    }
  } else {
    const flow = {
      "create-wallet": createWalletFlow,
      "import-wallet": importWalletFlow,
    }[onboardingFlow];

    renderComponent = (
      <WithNav
        navButtonLeft={
          step < flow.length - 1 && <NavBackButton onClick={prevStep} />
        }
        navbarStyle={{
          backgroundColor: theme.custom.colors.nav,
          borderRadius: "12px",
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.nav,
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url('coral-bg.png')`,
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          width: `${EXTENSION_WIDTH}px`,
          height: `${EXTENSION_HEIGHT}px`,
          background: theme.custom.colors.nav,
          display: "flex",
          flexDirection: "column",
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
