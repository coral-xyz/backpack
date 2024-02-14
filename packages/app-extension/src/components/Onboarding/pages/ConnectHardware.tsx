import { useEffect } from "react";
import type { WalletDescriptor } from "@coral-xyz/common";
import { useOnboarding } from "@coral-xyz/recoil";
import { YStack } from "@coral-xyz/tamagui";

import { useSteps } from "../../../hooks/useSteps";
import { ImportWallets } from "../../common/Account/ImportWallets";

import { BlockchainSelector } from "./BlockchainSelector";
import { FinishConnectHardware } from "./FinishConnectHardware";

export const ConnectHardware = (_props: {
  containerRef: any;
  navProps: any;
}) => {
  const { step, nextStep } = useSteps();

  const {
    onboardingData: {
      action,
      keyringType,
      mnemonic,
      blockchain,
      signedWalletDescriptors,
      selectedBlockchains,
    },
    setOnboardingData,
    handleSelectBlockchain,
  } = useOnboarding();

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
        await handleSelectBlockchain({ blockchain });
        nextStep();
      }}
      onNext={nextStep}
    />,
    <ImportWallets
      allowMultiple
      autoSelect
      newAccount
      key="ImportWallets"
      blockchain={blockchain!}
      mnemonic={mnemonic}
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
    <FinishConnectHardware key="Finish" />,
  ];

  return (
    <YStack
      style={{
        alignItems: "center",
        flex: 1,
        width: "100%",
      }}
    >
      {steps[step]}
    </YStack>
  );
};
