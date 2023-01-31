import { useEffect, useState } from "react";
import type {
  Blockchain,
  KeyringType,
  PublicKeyPath,
  SignedPublicKeyPath,
} from "@coral-xyz/common";
import { getCreateMessage } from "@coral-xyz/common";

import { useDefaultPublicKeyPath } from "../../../hooks/useDefaultPublicKeyPath";
import { useOnboarding } from "../../../hooks/useOnboarding";
import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { ImportAccounts } from "../../common/Account/ImportAccounts";
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
  const { step, nextStep, prevStep } = useSteps();
  const { getDefaultPublicKeyPath } = useDefaultPublicKeyPath();
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | null>(null);
  const [action, setAction] = useState<"create" | "import">();
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [openDrawer, setOpenDrawer] = useState(false);

  const {
    addPublicKeyPath,
    keyringInit,
    removeBlockchain,
    resetPublicKeyPaths,
    selectedBlockchains,
    signMessageForWallet,
  } = useOnboarding(mnemonic);

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    // and signatures that they might contain
    // e.g. user has navigated backward through the onboarding flow
    resetPublicKeyPaths();
  }, [action, keyringType, mnemonic]);

  const handleBlockchainClick = async (blockchain: Blockchain) => {
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setBlockchain(null);
      removeBlockchain(blockchain);
    } else {
      // Blockchain is being selected
      if (keyringType === "ledger" || action === "import") {
        // If wallet is a ledger, step through the ledger onboarding flow
        // OR if action is an import then open the drawer with the import accounts
        // component
        setBlockchain(blockchain);
        setOpenDrawer(true);
      } else if (action === "create") {
        const publicKeyPath = await getDefaultPublicKeyPath(
          blockchain,
          mnemonic!
        );
        const signature = await signMessageForWallet(
          blockchain,
          publicKeyPath,
          getCreateMessage(publicKeyPath.publicKey)
        );
        // Default path
        addPublicKeyPath({ ...publicKeyPath, signature });
      }
    }
  };

  const steps = [
    <InviteCodeForm
      onClickWaiting={onWaiting}
      onClickRecover={onRecover}
      onSubmit={(inviteCode) => {
        setInviteCode(inviteCode);
        nextStep();
      }}
    />,
    <UsernameForm
      inviteCode={inviteCode!}
      onNext={(username) => {
        setUsername(username);
        nextStep();
      }}
    />,
    <CreateOrImportWallet
      onNext={(action) => {
        setAction(action);
        nextStep();
      }}
    />,
    <KeyringTypeSelector
      action={action!}
      onNext={(keyringType: KeyringType) => {
        setKeyringType(keyringType);
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
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
        ]
      : []),
    <BlockchainSelector
      selectedBlockchains={selectedBlockchains}
      onClick={handleBlockchainClick}
      onNext={nextStep}
    />,
    ...(!isAddingAccount
      ? [
          <CreatePassword
            onNext={(password) => {
              setPassword(password);
              nextStep();
            }}
          />,
        ]
      : []),
    <Finish
      inviteCode={inviteCode}
      username={username}
      password={password!}
      keyringInit={keyringInit!}
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
            action={action!}
            signMessage={(publicKey: string) => getCreateMessage(publicKey)}
            signText={`Sign the message to authenticate with Backpack.`}
            onComplete={(signedPublicKeyPath: SignedPublicKeyPath) => {
              addPublicKeyPath(signedPublicKeyPath);
              setOpenDrawer(false);
            }}
            onClose={() => setOpenDrawer(false)}
          />
        ) : (
          <ImportAccounts
            blockchain={blockchain!}
            mnemonic={mnemonic!}
            allowMultiple={false}
            onNext={async (publicKeyPaths: Array<PublicKeyPath>) => {
              // Should only be one public key path
              const publicKeyPath = publicKeyPaths[0];
              const signature = await signMessageForWallet(
                blockchain!,
                publicKeyPath,
                getCreateMessage(publicKeyPath.publicKey)
              );
              addPublicKeyPath({ ...publicKeyPath, signature });
              setOpenDrawer(false);
            }}
          />
        )}
      </WithContaineredDrawer>
    </WithNav>
  );
};
