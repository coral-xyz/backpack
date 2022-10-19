import { useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import { WalletType } from "../WalletType";
import { BlockchainSelector } from "../BlockchainSelector";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import { CreatePassword } from "../../../common/Account/CreatePassword";
import { ImportAccounts } from "../../../common/Account/ImportAccounts";
import { WithContaineredDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../../common/Layout/Nav";
import { Finish } from "../Finish";
import { useSteps } from "../../../../hooks/useSteps";
import { OnboardHardware } from "../OnboardHardware";

export type WalletType = "mnemonic" | "ledger";

export const CreateImportAccount = ({
  action,
  containerRef,
  onClose,
  navProps,
}: {
  action: "create" | "import";
  containerRef: any;
  onClose: () => void;
  navProps: object;
}) => {
  const { step, nextStep, prevStep } = useSteps();
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleBlockchainSelect = (blockchain: Blockchain) => {
    setBlockchain(blockchain);
    if (walletType === "ledger") {
      // If wallet is a ledger, step through the ledger onboarding flow
      setOpenDrawer(true);
    } else if (action === "import") {
      // If we are importing accounts, open the drawer with the import accounts component
      setOpenDrawer(true);
    } else {
      nextStep();
    }
  };

  const handleOnboardHardware = () => {};

  const handleImportAccounts = () => {};

  const steps = [
    <WalletType
      action={action}
      onNext={(walletType) => {
        setWalletType(walletType as WalletType);
        nextStep();
      }}
    />,
    // Show the seed phrase if we are creating based on a mnemonic
    ...(walletType === "mnemonic"
      ? [
          <MnemonicInput
            readOnly={action === "create"}
            buttonLabel={action === "create" ? "Next" : "Import"}
            onNext={(mnemonic) => {
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
        ]
      : []),
    <BlockchainSelector onSelect={handleBlockchainSelect} />,
    <CreatePassword
      onNext={(password) => {
        setPassword(password);
        nextStep();
      }}
    />,
    // <Finish blockchain={blockchain} password={password} />,
  ];

  return (
    <WithNav
      navButtonLeft={
        <NavBackButton onClick={step === 0 ? onClose : prevStep} />
      }
      {...navProps}
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
        {walletType === "ledger" ? (
          <OnboardHardware
            blockchain={blockchain!}
            onComplete={handleOnboardHardware}
            onClose={() => setOpenDrawer(false)}
          />
        ) : (
          <ImportAccounts
            blockchain={blockchain!}
            mnemonic={mnemonic!}
            onNext={handleImportAccounts}
          />
        )}
      </WithContaineredDrawer>
    </WithNav>
  );
};
