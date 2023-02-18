import { useEffect, useState } from "react";
import type {
  KeyringType,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { getCreateMessage } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { useSignMessageForWallet } from "../../../hooks/useSignMessageForWallet";
import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { ImportWallets } from "../../common/Account/ImportWallets";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { WithContaineredDrawer } from "../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";

import { AlreadyOnboarded } from "./AlreadyOnboarded";
import { BlockchainSelector } from "./BlockchainSelector";
import { CreateOrImportWallet } from "./CreateOrImportWallet";
import { Finish } from "./Finish";
import { HardwareOnboard } from "./HardwareOnboard";
import { InviteCodeForm } from "./InviteCodeForm";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { NotificationsPermission } from "./NotificationsPermission";
import { useOnboarding } from "./OnboardingProvider";
import { UsernameForm } from "./UsernameForm";

export const OnboardAccount = ({
  onWaiting,
  onRecover,
  containerRef,
  navProps,
  isAddingAccount,
  isOnboarded,
}: {
  onWaiting: () => void;
  onRecover: () => void;
  containerRef: any;
  navProps: any;
  isAddingAccount?: boolean;
  isOnboarded?: boolean;
}) => {
  const background = useBackgroundClient();
  const { step, nextStep, prevStep } = useSteps();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { onboardingData, setOnboardingData, handleSelectBlockchain } =
    useOnboarding();
  const {
    inviteCode,
    username,
    action,
    keyringType,
    password,
    mnemonic,
    blockchain,
    signedWalletDescriptors,
    selectedBlockchains,
  } = onboardingData;
  const signMessageForWallet = useSignMessageForWallet(mnemonic);

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    setOnboardingData({
      signedWalletDescriptors: [],
    });
  }, [action, keyringType, mnemonic]);

  const steps = [
    <InviteCodeForm
      onClickWaiting={onWaiting}
      onClickRecover={onRecover}
      onSubmit={(inviteCode) => {
        setOnboardingData({ inviteCode });
        nextStep();
      }}
    />,
    <UsernameForm
      inviteCode={inviteCode!}
      onNext={(username) => {
        setOnboardingData({ username });
        nextStep();
      }}
    />,
    <CreateOrImportWallet
      onNext={(action) => {
        setOnboardingData({ action });
        nextStep();
      }}
    />,
    <KeyringTypeSelector
      action={action}
      onNext={(keyringType: KeyringType) => {
        setOnboardingData({ keyringType });
        nextStep();
      }}
    />,
    // Show the seed phrase if we are creating based on a mnemonic
    ...(keyringType === "mnemonic"
      ? [
          <MnemonicInput
            readOnly={action === "create"}
            buttonLabel={action === "create" ? "Next" : "Import"}
            onNext={(mnemonic) => {
              setOnboardingData({ mnemonic });
              nextStep();
            }}
          />,
        ]
      : []),
    <BlockchainSelector
      selectedBlockchains={selectedBlockchains}
      onClick={async (blockchain) => {
        await handleSelectBlockchain({
          blockchain,
          selectedBlockchains,
          background,
          onSelectImport: () => {
            setOpenDrawer(true);
          },
        });
      }}
      onNext={nextStep}
    />,
    ...(!isAddingAccount
      ? [
          <CreatePassword
            onNext={(password) => {
              setOnboardingData({ password });
              nextStep();
            }}
          />,
        ]
      : []),
    <NotificationsPermission onNext={nextStep} />,
    <Finish
      inviteCode={inviteCode}
      username={username}
      password={password!}
      keyringInit={{ mnemonic, signedWalletDescriptors }}
      isAddingAccount={isAddingAccount}
    />,
  ];

  if (isOnboarded && step !== steps.length - 1) {
    return <AlreadyOnboarded />;
  }

  return (
    <WithNav
      navButtonLeft={
        step > 0 && step !== steps.length - 1 ? (
          <NavBackButton onClick={prevStep} />
        ) : undefined
      }
      {...navProps}
      // Only display the onboarding menu on the first step
      navButtonRight={step === 0 ? navProps.navButtonRight : undefined}
    >
      {steps[step]}

      <WithContaineredDrawer
        containerRef={containerRef}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        paperStyles={{
          height: "calc(100% - 56px)",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        {keyringType === "ledger" ? (
          <HardwareOnboard
            blockchain={blockchain!}
            // @ts-ignore
            action={action}
            signMessage={(publicKey: string) => getCreateMessage(publicKey)}
            signText={`Sign the message to authenticate with Backpack.`}
            onClose={() => setOpenDrawer(false)}
            onComplete={(signedWalletDescriptor: SignedWalletDescriptor) => {
              setOnboardingData({
                signedWalletDescriptors: [
                  ...signedWalletDescriptors,
                  signedWalletDescriptor,
                ],
              });
              setOpenDrawer(false);
            }}
          />
        ) : (
          <ImportWallets
            blockchain={blockchain!}
            mnemonic={mnemonic!}
            allowMultiple={false}
            onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
              // Should only be one public key path
              const walletDescriptor = walletDescriptors[0];
              const signature = await signMessageForWallet(
                walletDescriptor,
                getCreateMessage(walletDescriptor.publicKey)
              );
              setOnboardingData({
                signedWalletDescriptors: [
                  ...signedWalletDescriptors,
                  {
                    ...walletDescriptor,
                    signature,
                  },
                ],
              });
              setOpenDrawer(false);
            }}
          />
        )}
      </WithContaineredDrawer>
    </WithNav>
  );
};
