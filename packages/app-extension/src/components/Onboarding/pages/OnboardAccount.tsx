import { useEffect } from "react";
import type {
  KeyringType,
  PrivateKeyWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useOnboarding } from "@coral-xyz/recoil";
import { useTheme,XStack, YStack } from "@coral-xyz/tamagui";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { ImportWallets } from "../../common/Account/ImportWallets";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { PrivateKeyInput } from "../../common/Account/PrivateKeyInput";

import { AccountName } from "./AccountName";
import { AlreadyOnboarded } from "./AlreadyOnboarded";
import { BackupInput } from "./BackupInput";
import { BlockchainSelector } from "./BlockchainSelector";
import { CreateOrImportWallet } from "./CreateOrImportWallet";
import { Finish } from "./Finish";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { RecoveryPhraseCopyWarning } from "./RecoveryPhraseCopyWarning";

export const OnboardAccount = ({
  isAddingAccount,
  isOnboarded,
}: {
  isAddingAccount?: boolean;
  isOnboarded?: boolean;
}) => {
  const { t } = useTranslation();
  const { step, nextStep, prevStep } = useSteps();

  const {
    onboardingData: {
      action,
      blockchain,
      keyringType,
      mnemonic,
      selectedBlockchains,
      signedWalletDescriptors,
    },
    setOnboardingData,
    handleSelectBlockchain,
    handlePrivateKeyInput,
  } = useOnboarding();

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
    <AccountName
      key="AccountName"
      onNext={(name) => {
        if (name) {
          setOnboardingData({ accountName: name });
        }
        nextStep();
      }}
    />,
    ...(action === "recover_backpack_backup"
      ? [
        <BackupInput
          key="BackupRecovery"
          onNext={() => {
              nextStep();
            }}
          />,
        ]
      : []),
    ...(action === "import"
      ? [
        <KeyringTypeSelector
          key="KeyringTypeSelector"
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
          // Show the secret recovery phrase warning page if a new wallet is being created
          ...(action === "create"
            ? [
              <RecoveryPhraseCopyWarning
                key="RecoveryPhraseCopyWarning"
                onNext={nextStep}
                />,
              ]
            : []),
        <MnemonicInput
          key="MnemonicInput"
          readOnly={action === "create"}
          buttonLabel={action === "create" ? t("next") : t("import")}
          onNext={async (mnemonic) => {
              setOnboardingData({ mnemonic });
              nextStep();
            }}
          onPrevious={prevStep}
          />,
        ]
      : []),
    ...(keyringType === "private-key"
      ? // If keyring type is a private key we don't need to display the blockchain
        // selector
        [
          <BlockchainSelector
            key="BlockchainSelector"
            selectedBlockchains={selectedBlockchains}
            onClick={async (blockchain) => {
              await handleSelectBlockchain({ blockchain });
              nextStep();
            }}
            onNext={() => {}}
          />,
          <PrivateKeyInput
            blockchain={blockchain!}
            key="PrivateKeyInput"
            onNext={async (result: PrivateKeyWalletDescriptor) => {
              await handlePrivateKeyInput(result);
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
              await handleSelectBlockchain({ blockchain });
              nextStep();
            }}
            onNext={nextStep}
          />,
          ...(keyringType === "ledger" || action === "import"
            ? [
              <ImportWallets
                allowMultiple
                autoSelect
                newAccount
                key="ImportWallets"
                blockchain={blockchain!}
                mnemonic={mnemonic!}
                onNext={(walletDescriptors: Array<WalletDescriptor>) => {
                    setOnboardingData({
                      signedWalletDescriptors: [
                        ...signedWalletDescriptors,
                        ...walletDescriptors,
                      ],
                    });
                    nextStep();
                  }}
                />,
              ]
            : []),
        ]
      : []),
    ...(!isAddingAccount && action !== "recover_backpack_backup"
      ? [
        <CreatePassword
          key="CreatePassword"
          onNext={(password) => {
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
    <YStack
      style={{
        alignItems: "center",
        height: 600,
        width: "100%",
        ...(step === 0 || step === steps.length - 1
          ? { justifyContent: "center" }
          : {}),
      }}
    >
      {steps[step]}
      {step > 0 && step < steps.length - 1 ? (
        <_StepIndicators
          amount={steps.length}
          current={step}
          onPrevious={prevStep}
        />
      ) : null}
    </YStack>
  );
};

function _StepIndicators({
  amount,
  current,
  onPrevious,
}: {
  amount: number;
  current: number;
  onPrevious: () => void;
}) {
  const theme = useTheme();
  return (
    <XStack justifyContent="center" gap={16} paddingVertical={24}>
      {/* amount - 1 number of steps in order to not include the last page */}
      {...Array.from({ length: amount - 1 }).map((_, idx) => {
        const canGoBack = idx === current - 1;
        return (
          <div
            key={idx}
            onClick={canGoBack ? onPrevious : undefined}
            style={{
              background:
                idx <= current ? theme.accentBlue.val : theme.gray7.val,
              borderRadius: "100%",
              cursor: canGoBack ? "pointer" : undefined,
              opacity: idx < current ? 0.3 : 1,
              height: 12,
              width: 12,
            }}
          />
        );
      })}
    </XStack>
  );
}
