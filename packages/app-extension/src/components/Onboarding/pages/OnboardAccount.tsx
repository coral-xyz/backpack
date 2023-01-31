import { useEffect, useState } from "react";
import type {
  Blockchain,
  BlockchainKeyringInit,
  KeyringType,
} from "@coral-xyz/common";
import {
  DerivationPath,
  getCreateMessage,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { encode } from "bs58";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import type { SelectedAccount } from "../../common/Account/ImportAccounts";
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
  const background = useBackgroundClient();
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | null>(null);
  const [action, setAction] = useState<"create" | "import">();
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchainKeyrings, setBlockchainKeyrings] = useState<
    Array<BlockchainKeyringInit>
  >([]);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [openDrawer, setOpenDrawer] = useState(false);

  const selectedBlockchains = blockchainKeyrings.map((b) => b.blockchain);

  useEffect(() => {
    // Reset blockchain keyrings on certain changes that invalidate the addresses
    // and signatures that they might contain
    // e.g. user has navigated backward through the onboarding flow
    setBlockchainKeyrings([]);
  }, [action, keyringType, mnemonic]);

  const handleBlockchainClick = async (blockchain: Blockchain) => {
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setBlockchain(null);
      setBlockchainKeyrings(
        blockchainKeyrings.filter((b) => b.blockchain !== blockchain)
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
        // We are creating a new wallet, generate the signature using a default
        // derivation path and account index
        signForWallet(blockchain, DerivationPath.Default, 0);
      }
    }
  };

  const signForWallet = async (
    blockchain: Blockchain,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string
  ) => {
    if (!publicKey) {
      // No publicKey given, this is a create action, so preview the public keys
      // and grab the one at the index
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
        params: [blockchain, mnemonic, derivationPath, accountIndex + 1],
      });
      publicKey = publicKeys[accountIndex];
    }
    const signature = await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
      params: [
        blockchain,
        encode(Buffer.from(getCreateMessage(publicKey!), "utf-8")),
        publicKey!,
        {
          derivationPath,
          accountIndex,
          mnemonic,
        },
      ],
    });
    addBlockchainKeyring({
      blockchain: blockchain!,
      derivationPath,
      accountIndex,
      publicKey: publicKey!,
      signature,
    });
  };

  // Add the initialisation parameters for a blockchain keyring to state
  const addBlockchainKeyring = (blockchainKeyring: BlockchainKeyringInit) => {
    setBlockchainKeyrings([...blockchainKeyrings, blockchainKeyring]);
  };

  const keyringInit = {
    mnemonic,
    blockchainKeyrings,
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
            onComplete={(result: BlockchainKeyringInit) => {
              addBlockchainKeyring(result);
              setOpenDrawer(false);
            }}
            onClose={() => setOpenDrawer(false)}
          />
        ) : (
          <ImportAccounts
            blockchain={blockchain!}
            mnemonic={mnemonic!}
            allowMultiple={false}
            onNext={(
              selectedAccounts: SelectedAccount[],
              derivationPath: DerivationPath
            ) => {
              // Should only be one selected account due to allowMultiple being false
              const account = selectedAccounts[0];
              signForWallet(
                blockchain!,
                derivationPath,
                account.index,
                account.publicKey
              );
              setOpenDrawer(false);
            }}
          />
        )}
      </WithContaineredDrawer>
    </WithNav>
  );
};
