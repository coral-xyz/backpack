import { useEffect, useState } from "react";
import type {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
  KeyringType,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  getAuthMessage,
  toTitleCase,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { encode } from "bs58";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
// import { BlockchainSelector } from "./BlockchainSelector";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { HardwareOnboard } from "../../Onboarding/pages/HardwareOnboard";

import { Finish } from "./Finish";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { MnemonicSearch } from "./MnemonicSearch";
import { RecoverAccountUsernameForm } from "./RecoverAccountUsernameForm";

export const RecoverAccount = ({
  onClose,
  navProps,
  isAddingAccount,
}: {
  onClose: () => void;
  navProps: any;
  isAddingAccount?: boolean;
}) => {
  const { step, nextStep, prevStep } = useSteps();
  const background = useBackgroundClient();
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  // TODO onboarded blockchains is currently unused but it will be used to recover
  // multiple accounts on different blockchains
  const [, setOnboardedBlockchains] = useState<Array<Blockchain>>([]);
  const [blockchainKeyrings, setBlockchainKeyrings] = useState<
    Array<BlockchainKeyringInit>
  >([]);

  const authMessage = userId ? getAuthMessage(userId) : "";

  useEffect(() => {
    (async () => {
      if (username) {
        const response = await fetch(`${BACKEND_API_URL}/users/${username}`);
        const json = await response.json();
        if (response.ok) {
          setUserId(json.id);
          if (json.publicKeys.length > 0) {
            setOnboardedBlockchains(
              json.publicKeys.map(
                (b: { blockchain: Blockchain }) => b.blockchain
              )
            );
            // Default to first available blockchain. For mnemonic keyrings we
            // can do this and search all available public keys for the mnemonic
            // to find a match. For ledger keyrings we need to prompt them to open
            // a specific app on the ledger so we'll allow them to select which
            // blockchain they want to use as part of the flow.
            setBlockchain(json.publicKeys[0].blockchain);
          }
        }
      }
    })();
  }, [username]);

  const signForWallet = async (
    blockchain: Blockchain,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string
  ) => {
    const signature = await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
      params: [
        blockchain,
        encode(Buffer.from(authMessage, "utf-8")),
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
    <RecoverAccountUsernameForm
      onNext={(username: string, publicKey: string) => {
        setUsername(username);
        setPublicKey(publicKey);
        nextStep();
      }}
    />,
    <KeyringTypeSelector
      action={"recover"}
      onNext={(keyringType: KeyringType) => {
        setKeyringType(keyringType);
        nextStep();
      }}
    />,
    ...(keyringType === "mnemonic"
      ? [
          // Using a mnemonic
          <MnemonicInput
            buttonLabel={"Next"}
            onNext={(mnemonic: string) => {
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
          <MnemonicSearch
            blockchain={blockchain!}
            mnemonic={mnemonic!}
            publicKey={publicKey!}
            onNext={(derivationPath: DerivationPath, accountIndex: number) => {
              signForWallet(
                blockchain!,
                derivationPath,
                accountIndex,
                publicKey!
              );
              nextStep();
            }}
            onRetry={prevStep}
          />,
        ]
      : [
          // Using a ledger
          <HardwareOnboard
            blockchain={blockchain!}
            action={"search"}
            searchPublicKey={publicKey!}
            signMessage={getAuthMessage}
            signText={`Sign the message to authenticate with Backpack`}
            onComplete={(keyringInit: BlockchainKeyringInit) => {
              addBlockchainKeyring(keyringInit);
              nextStep();
            }}
          />,
        ]),
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
    ...(blockchainKeyrings.length > 0
      ? [
          <Finish
            inviteCode={undefined}
            userId={userId}
            username={username}
            password={password!}
            keyringInit={keyringInit!}
            isAddingAccount={isAddingAccount}
          />,
        ]
      : []),
  ];

  return (
    <WithNav
      navButtonLeft={<NavBackButton onClick={step > 0 ? prevStep : onClose} />}
      {...navProps}
      // Only display the onboarding menu on the first step
      navButtonRight={undefined}
    >
      {steps[step]}
    </WithNav>
  );
};
