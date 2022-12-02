import { useEffect, useState } from "react";
import type {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
  KeyringType,
} from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import type Transport from "@ledgerhq/hw-transport";

import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
// import { BlockchainSelector } from "./BlockchainSelector";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { ConnectHardwareSearching } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareWelcome } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";

import { Finish } from "./Finish";
import { HardwareSearch } from "./HardwareSearch";
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
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError] = useState(false);
  const [, setOnboardedBlockchains] = useState<Array<Blockchain>>([]);
  const [blockchainKeyrings, setBlockchainKeyrings] = useState<
    Array<BlockchainKeyringInit>
  >([]);

  useEffect(() => {
    (async () => {
      if (username) {
        const response = await fetch(`${BACKEND_API_URL}/users/${username}`);
        const json = await response.json();
        if (response.ok) {
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
              setBlockchainKeyrings([
                {
                  blockchain: blockchain!,
                  derivationPath,
                  accountIndex,
                  // No signature required because this isn't being used to setup
                  // an account
                  signature: null,
                  publicKey: publicKey!,
                },
              ]);
              nextStep();
            }}
            onRetry={prevStep}
          />,
        ]
      : [
          /**
          ...(onboardedBlockchains.length > 1
            ? [
                // If multiple blockchains have been onboarded, then display the selector
                // because the user will need to open the correct app on their Ledger.
                <BlockchainSelector
                  selectedBlockchains={[]}
                  onClick={handleBlockchainClick}
                  onNext={nextStep}
                  isRecovery={true}
                />,
              ]
            : []),
        **/
          <ConnectHardwareWelcome onNext={nextStep} />,
          <ConnectHardwareSearching
            blockchain={blockchain!}
            onNext={(transport) => {
              setTransport(transport);
              nextStep();
            }}
            isConnectFailure={!!transportError}
          />,
          <HardwareSearch
            blockchain={blockchain!}
            transport={transport!}
            publicKey={publicKey!}
            onNext={(derivationPath: DerivationPath, accountIndex: number) => {
              setBlockchainKeyrings([
                {
                  blockchain: blockchain!,
                  derivationPath,
                  accountIndex,
                  // No signature required because this isn't being used to setup
                  // an account
                  signature: null,
                  publicKey: publicKey!,
                },
              ]);
              nextStep();
            }}
            onRetry={prevStep}
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
    <Finish
      inviteCode={undefined}
      username={username}
      password={password!}
      keyringInit={keyringInit!}
    />,
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
