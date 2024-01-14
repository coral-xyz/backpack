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
import { FinishConnectHardware } from "./FinishConnectHardware";
import { KeyringTypeSelector } from "./KeyringTypeSelector";

export const ConnectHardware = ({
  containerRef,
  navProps,
}: {
  containerRef: any;
  navProps: any;
}) => {
  const { step, nextStep, prevStep } = useSteps();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { onboardingData, setOnboardingData, handleSelectBlockchain } =
    useOnboarding();
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
    setOnboardingData({ action: "import", keyringType: "ledger" });
  }, []);

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    setOnboardingData({
      signedWalletDescriptors: [],
    });
  }, [action, keyringType, mnemonic, setOnboardingData]);

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    setOnboardingData({
      signedWalletDescriptors: [],
    });
  }, [action, keyringType, mnemonic, setOnboardingData]);

  // return null;

  const steps = [
    <BlockchainSelector
      key="BlockchainSelector"
      selectedBlockchains={selectedBlockchains}
      onClick={async (blockchain) => {
        await handleSelectBlockchain({
          blockchain,
        });
        setOpenDrawer(true);
      }}
      onNext={nextStep}
    />,
    <FinishConnectHardware key="Finish" />,
  ];

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
          mnemonic={mnemonic}
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
