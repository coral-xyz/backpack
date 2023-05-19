import type {
  KeyringType,
  PrivateKeyWalletDescriptor,
  ServerPublicKey,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { Blockchain, getAuthMessage } from "@coral-xyz/common";
import { useOnboarding, useRpcRequests } from "@coral-xyz/recoil";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { PrivateKeyInput } from "../../common/Account/PrivateKeyInput";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { useHardwareOnboardSteps } from "../../Onboarding/pages/HardwareOnboard";

import { AlreadyOnboarded } from "./AlreadyOnboarded";
import { Finish } from "./Finish";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { MnemonicSearch } from "./MnemonicSearch";
import { NotificationsPermission } from "./NotificationsPermission";
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
  const { step, nextStep, prevStep } = useSteps();
  const { signMessageForWallet } = useRpcRequests();
  const { onboardingData, setOnboardingData, handlePrivateKeyInput } =
    useOnboarding();
  const {
    userId,
    keyringType,
    mnemonic,
    signedWalletDescriptors,
    serverPublicKeys,
  } = onboardingData;
  const authMessage = userId ? getAuthMessage(userId) : "";
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

  const steps = [
    // <TwitterConnect key="TwitterConnect" />,
    <RecoverAccountUsernameForm
      key="RecoverAccountUsernameForm"
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
      key="KeyringTypeSelector"
      action="recover"
      onNext={(keyringType: KeyringType) => {
        setOnboardingData({ keyringType });
        nextStep();
      }}
    />,
    ...(keyringType === "mnemonic"
      ? [
          // Using a mnemonic
        <MnemonicInput
          key="MnemonicInput"
          buttonLabel="Next"
          onNext={async (mnemonic: string) => {
              setOnboardingData({ mnemonic });
              nextStep();
            }}
          />,
        <MnemonicSearch
          key="MnemonicSearch"
          serverPublicKeys={serverPublicKeys!}
          mnemonic={mnemonic!}
          onRetry={prevStep}
          onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
              const signedWalletDescriptors = await Promise.all(
                walletDescriptors.map(async (w) => ({
                  ...w,
                  signature: await signMessageForWallet(
                    w.blockchain,
                    w.publicKey,
                    authMessage,
                    {
                      mnemonic,
                      signedWalletDescriptors: [{ ...w, signature: "" }],
                    }
                  ),
                }))
              );
              setOnboardingData({ signedWalletDescriptors });
              nextStep();
            }}
          />,
        ]
      : []),
    ...(keyringType === "ledger" ? hardwareOnboardSteps : []),
    ...(keyringType === "private-key"
      ? [
        <PrivateKeyInput
          key="PrivateKeyInput"
          serverPublicKeys={serverPublicKeys}
          onNext={async (result: PrivateKeyWalletDescriptor) => {
              await handlePrivateKeyInput(result);
              nextStep();
            }}
          onboarding
          />,
        ]
      : []),
    ...(!isAddingAccount
      ? [
        <CreatePassword
          key="CreatePassword"
          onNext={async (password) => {
              setOnboardingData({ password });
              nextStep();
            }}
          />,
        ]
      : []),
    <NotificationsPermission key="NotificationsPermission" onNext={nextStep} />,
    <Finish key="Finish" isAddingAccount={isAddingAccount} />,
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
      {steps[step]}
    </WithNav>
  );
};
