import { useEffect, useState } from "react";
import type {
  KeyringType,
  ServerPublicKey,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  Blockchain,
  getAuthMessage,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useOnboarding,
  useSignMessageForWallet,
} from "@coral-xyz/recoil";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { useHardwareOnboardSteps } from "../../Onboarding/pages/HardwareOnboard";

import { AlreadyOnboarded } from "./AlreadyOnboarded";
import { Finish } from "./Finish";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { MnemonicSearch } from "./MnemonicSearch";
import { RecoverAccountUsernameForm } from "./RecoverAccountUsernameForm";

export const RecoverAccount = ({
  onClose,
  navProps,
  isAddingAccount,
  isOnboarded,
}: {
  onClose: () => void;
  navProps: any;
  isAddingAccount?: boolean;
  isOnboarded?: boolean;
}) => {
  const background = useBackgroundClient();
  const [loading, setLoading] = useState(false);
  const { step, nextStep, prevStep } = useSteps();
  const { onboardingData, setOnboardingData, maybeCreateUser } =
    useOnboarding();
  const {
    userId,
    keyringType,
    mnemonic,
    signedWalletDescriptors,
    serverPublicKeys,
  } = onboardingData;
  console.log("RecoverAccount:onboardingData", onboardingData);

  const authMessage = userId ? getAuthMessage(userId) : "";
  const signMessageForWallet = useSignMessageForWallet(mnemonic);
  const hardwareOnboardSteps = useHardwareOnboardSteps({
    blockchain:
      serverPublicKeys.length > 0
        ? serverPublicKeys[0].blockchain!
        : Blockchain.SOLANA, // TODO refactor out this default requirement
    action: "search",
    searchPublicKey:
      serverPublicKeys.length > 0 ? serverPublicKeys[0].publicKey : undefined,
    signMessage: authMessage,
    signText: "Sign the message to authenticate with Backpack",
    onComplete: (signedWalletDescriptor: SignedWalletDescriptor) => {
      setOnboardingData({
        signedWalletDescriptors: [
          ...signedWalletDescriptors,
          signedWalletDescriptor,
        ],
      });
      nextStep();
    },
    nextStep,
    prevStep,
  });

  async function tryCreateUser(options: {
    password?: string;
    signedWalletDescriptors?: SignedWalletDescriptor[];
  }) {
    setLoading(true);
    // When adding an account a password isn't necessary
    const res = await maybeCreateUser(options);
    setLoading(false);
    if (res) {
      nextStep();
    } else {
      if (
        confirm("There was an issue setting up your account. Please try again.")
      ) {
        window.location.reload();
      }
    }
  }

  useEffect(() => {
    (async () => {
      // This is a mitigation to ensure the keyring store doesn't lock before
      // creating the user on the server.
      //
      // Would be better (though probably not a priority atm) to ensure atomicity.
      // E.g. we could generate the UUID here on the client, create the keyring store,
      // and only then create the user on the server. If the server fails, then
      // rollback on the client.
      //
      // An improvement for the future!
      if (isAddingAccount) {
        setOnboardingData({ isAddingAccount });
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
          params: [],
        });
      }
    })();
  }, [isAddingAccount]);

  const steps = [
    <RecoverAccountUsernameForm
      onNext={(
        userId: string,
        username: string,
        serverPublicKeys: ServerPublicKey[]
      ) => {
        setOnboardingData({ userId, username, serverPublicKeys });
        nextStep();
      }}
    />,
    <KeyringTypeSelector
      action={"recover"}
      onNext={(keyringType: KeyringType) => {
        setOnboardingData({ keyringType });
        nextStep();
      }}
    />,
    ...(keyringType === "mnemonic"
      ? [
          // Using a mnemonic
          <MnemonicInput
            buttonLabel={"Next"}
            onNext={(mnemonic: string) => {
              setOnboardingData({ mnemonic });
              nextStep();
            }}
          />,
          <MnemonicSearch
            serverPublicKeys={serverPublicKeys!}
            mnemonic={mnemonic!}
            onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
              const signedWalletDescriptors = await Promise.all(
                walletDescriptors.map(async (w) => ({
                  ...w,
                  signature: await signMessageForWallet(w, authMessage),
                }))
              );
              setOnboardingData({ signedWalletDescriptors });
              nextStep();

              if (isAddingAccount) {
                await tryCreateUser({ signedWalletDescriptors });
              }
            }}
            onRetry={prevStep}
          />,
        ]
      : hardwareOnboardSteps),
    ...(!isAddingAccount
      ? [
          <CreatePassword
            onNext={async (password) => {
              setOnboardingData({ password });
              await tryCreateUser({ password });
            }}
          />,
        ]
      : []),
    ...(signedWalletDescriptors.length > 0 ? [<Finish />] : []),
  ];

  // Cant go backwards from the last step as the keyring is already created
  const isLastStep = step === steps.length - 1;
  // Cant go backwards from the password step as can hit mnemonic search which
  // auto progresses. This could be handled by jumping to a step.
  const isPasswordStep = steps[step].type.name === "CreatePassword";
  // Display message if already onboarded and not on last step
  if (isOnboarded && !isLastStep) {
    return <AlreadyOnboarded />;
  }

  return (
    <WithNav
      navButtonLeft={
        !isLastStep && !isPasswordStep ? (
          <NavBackButton onClick={step > 0 ? prevStep : onClose} />
        ) : undefined
      }
      {...navProps}
      // Only display the onboarding menu on the first step
      navButtonRight={undefined}
    >
      {loading ? <Loading /> : steps[step]}
    </WithNav>
  );
};
