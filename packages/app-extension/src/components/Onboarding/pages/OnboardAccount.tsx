import { useEffect, useState } from "react";
import type {
  KeyringType,
  PrivateKeyWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useOnboarding } from "@coral-xyz/recoil";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { ImportWallets } from "../../common/Account/ImportWallets";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { PrivateKeyInput } from "../../common/Account/PrivateKeyInput";
import { WithContaineredDrawer } from "../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";

import { AlreadyOnboarded } from "./AlreadyOnboarded";
import { BackupInput } from "./BackupInput";
import { BlockchainSelector } from "./BlockchainSelector";
import { CreateOrImportWallet } from "./CreateOrImportWallet";
import { Finish } from "./Finish";
import { KeyringTypeSelector } from "./KeyringTypeSelector";

export const OnboardAccount = ({
  containerRef,
  navProps,
  isAddingAccount,
  isOnboarded,
}: {
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
  const {
    action,
    keyringType,
    mnemonic,
    blockchain,
    signedWalletDescriptors,
    selectedBlockchains,
  } = onboardingData;
  const { t } = useTranslation();

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    setOnboardingData({
      signedWalletDescriptors: [],
    });
  }, [action, keyringType, mnemonic, setOnboardingData]);

  const steps = [
    <CreateOrImportWallet
      key="CreateOrImportWallet"
      onNext={(data) => {
        setOnboardingData({ ...data });
        nextStep();
      }}
    />,
    ...(action === "recover_backpack_backup"
      ? [
          <BackupInput
            key="BackupRecovery"
            onNext={async () => {
              nextStep();
            }}
          />,
        ]
      : []),
    ...(action === "import"
      ? [
          <KeyringTypeSelector
            key="KeyringTypeSelector"
            action={action}
            onNext={(keyringType: KeyringType | "recover_backpack_backup") => {
              if (keyringType === "recover_backpack_backup") {
                setOnboardingData({ action: "recover_backpack_backup" });
              } else {
                setOnboardingData({ keyringType });
                nextStep();
              }
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
            buttonLabel={action === "create" ? t("next") : t("import")}
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
          />,
        ]
      : []),
    ...(keyringType === "mnemonic" || keyringType === "ledger"
      ? // if were importing mnemonic of ledger we need to select the blockchiain
        [
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
        ]
      : []),
    ...(!isAddingAccount && action !== "recover_backpack_backup"
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
        <ImportWallets
          blockchain={blockchain!}
          mnemonic={mnemonic!}
          allowMultiple
          onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
            setOnboardingData({
              signedWalletDescriptors: [
                ...signedWalletDescriptors,
                ...walletDescriptors,
              ],
            });
            setOpenDrawer(false);
          }}
          newAccount
          autoSelect
        />
      </WithContaineredDrawer>
    </WithNav>
  );
};
