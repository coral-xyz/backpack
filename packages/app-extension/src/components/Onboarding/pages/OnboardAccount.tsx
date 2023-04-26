import { useEffect, useState } from "react";
import type {
  KeyringType,
  PrivateKeyWalletDescriptor,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { getCreateMessage } from "@coral-xyz/common";
import { useOnboarding, useRpcRequests } from "@coral-xyz/recoil";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { ImportWallets } from "../../common/Account/ImportWallets";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { PrivateKeyInput } from "../../common/Account/PrivateKeyInput";
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
import { UsernameForm } from "./UsernameForm";

export const OnboardAccount = ({
  onRecover,
  containerRef,
  navProps,
  isAddingAccount,
  isOnboarded,
}: {
  onRecover: () => void;
  containerRef: any;
  navProps: any;
  isAddingAccount?: boolean;
  isOnboarded?: boolean;
}) => {
  const { step, nextStep, prevStep } = useSteps();
  const [openDrawer, setOpenDrawer] = useState(false);
  const {
    onboardingData,
    setOnboardingData,
    handleSelectBlockchain,
    handlePrivateKeyInput,
  } = useOnboarding();
  const { signMessageForWallet } = useRpcRequests();
  const {
    inviteCode,
    action,
    keyringType,
    mnemonic,
    blockchain,
    signedWalletDescriptors,
    selectedBlockchains,
  } = onboardingData;

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    setOnboardingData({
      signedWalletDescriptors: [],
    });
  }, [action, keyringType, mnemonic, setOnboardingData]);

  const steps = [
    <InviteCodeForm
      key="InviteCodeForm"
      onClickRecover={onRecover}
      onSubmit={(inviteCode) => {
        setOnboardingData({ inviteCode });
        nextStep();
      }}
    />,
    <UsernameForm
      key="UsernameForm"
      inviteCode={inviteCode!}
      onNext={(username) => {
        setOnboardingData({ username });
        nextStep();
      }}
    />,
    <CreateOrImportWallet
      key="CreateOrImportWallet"
      onNext={(data) => {
        setOnboardingData({ ...data });
        nextStep();
      }}
    />,
    ...(action === "import"
      ? [
        <KeyringTypeSelector
          key="KeyringTypeSelector"
          action={action}
          onNext={(keyringType: KeyringType) => {
              setOnboardingData({ keyringType });
              nextStep();
            }}
          />,
        ]
      : []),
    // Show the seed phrase if we are creating based on a mnemonic
    ...(keyringType === "mnemonic"
      ? [
        <MnemonicInput
          key="MnemonicInput"
          readOnly={action === "create"}
          buttonLabel={action === "create" ? "Next" : "Import"}
          onNext={async (mnemonic) => {
              setOnboardingData({ mnemonic });
              nextStep();
            }}
          />,
        ]
      : []),
    ...(keyringType === "private-key"
      ? // If keyring type is a private key we don't need to display the blockchain
        // selector
        [
          <PrivateKeyInput
            key="PrivateKeyInput"
            onNext={(result: PrivateKeyWalletDescriptor) => {
              handlePrivateKeyInput(result);
              nextStep();
            }}
            onboarding
          />,
        ]
      : [
        <BlockchainSelector
          key="BlockchainSelector"
          selectedBlockchains={selectedBlockchains}
          onClick={async (blockchain) => {
              await handleSelectBlockchain({
                blockchain,
              });
              // If wallet is a ledger, step through the ledger onboarding flow
              // OR if action is an import then open the drawer with the import accounts
              // component
              if (keyringType === "ledger" || action === "import") {
                setOpenDrawer(true);
              }
            }}
          onNext={nextStep}
          />,
        ]),
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
            // @ts-expect-error not assignable to type string ...
            action={action}
            signMessage={(publicKey: string) => getCreateMessage(publicKey)}
            signText="Sign the message to authenticate with Backpack."
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
                walletDescriptor.blockchain,
                walletDescriptor.publicKey,
                getCreateMessage(walletDescriptor.publicKey),
                {
                  mnemonic: mnemonic!,
                  signedWalletDescriptors: [
                    { ...walletDescriptor, signature: "" },
                  ],
                }
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
