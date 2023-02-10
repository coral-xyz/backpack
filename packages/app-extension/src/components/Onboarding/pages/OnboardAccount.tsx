import { useEffect, useState } from "react";
import type {
  Blockchain,
  KeyringType,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  getBlockchainFromPath,
  getCreateMessage,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

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
import { UsernameForm } from "./UsernameForm";

const { base58 } = ethers.utils;

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
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | null>(null);
  const [action, setAction] = useState<"create" | "import">();
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [signedWalletDescriptors, setSignedWalletDescriptors] = useState<
    Array<SignedWalletDescriptor>
  >([]);

  const signMessageForWallet = useSignMessageForWallet(mnemonic);

  const selectedBlockchains = [
    ...new Set(
      signedWalletDescriptors.map((s) =>
        getBlockchainFromPath(s.derivationPath)
      )
    ),
  ];

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    // and signatures that they might contain
    // e.g. user has navigated backward through the onboarding flow
    setSignedWalletDescriptors([]);
  }, [action, keyringType, mnemonic]);

  const handleBlockchainClick = async (blockchain: Blockchain) => {
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setBlockchain(null);
      setSignedWalletDescriptors(
        signedWalletDescriptors.filter(
          (s) => getBlockchainFromPath(s.derivationPath) !== blockchain
        )
      );
    } else {
      // Blockchain is being selected
      if (keyringType === "ledger" || action === "import") {
        // If wallet is a ledger, step through the ledger onboarding flow
        // OR if action is an import then open the drawer with the import accounts
        // component
        setBlockchain(blockchain);
        setOpenDrawer(true);
      } else if (action === "create") {
        const walletDescriptor = await background.request({
          method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
          params: [blockchain, 0, mnemonic],
        });
        const signature = await background.request({
          method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
          params: [
            blockchain,
            walletDescriptor.publicKey,
            base58.encode(
              Buffer.from(getCreateMessage(walletDescriptor.publicKey), "utf-8")
            ),
            [mnemonic, [walletDescriptor.derivationPath]],
          ],
        });
        setSignedWalletDescriptors([
          ...signedWalletDescriptors,
          {
            ...walletDescriptor,
            signature,
          },
        ]);
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
            action={action!}
            signMessage={(publicKey: string) => getCreateMessage(publicKey)}
            signText={`Sign the message to authenticate with Backpack.`}
            onComplete={(signedWalletDescriptor: SignedWalletDescriptor) => {
              setSignedWalletDescriptors([
                ...signedWalletDescriptors,
                signedWalletDescriptor,
              ]);
              setOpenDrawer(false);
            }}
            onClose={() => setOpenDrawer(false)}
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
              setSignedWalletDescriptors([
                ...signedWalletDescriptors,
                {
                  ...walletDescriptor,
                  signature,
                },
              ]);
              setOpenDrawer(false);
            }}
          />
        )}
      </WithContaineredDrawer>
    </WithNav>
  );
};
