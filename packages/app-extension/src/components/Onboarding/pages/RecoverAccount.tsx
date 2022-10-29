import { useState, useEffect } from "react";
import Transport from "@ledgerhq/hw-transport";
import {
  Header,
  PrimaryButton,
  SubtextParagraph,
  TextField,
} from "../../common";
import { getWaitlistId } from "../../common/WaitingRoom";
import { TextInput } from "../../common/Inputs";
import {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
  KeyringType,
} from "@coral-xyz/common";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { RecoverAccountUsernameForm } from "./RecoverAccountUsernameForm";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { BlockchainSelector } from "./BlockchainSelector";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { MnemonicSearch } from "./MnemonicSearch";
import { HardwareSearch } from "./HardwareSearch";
import { Finish } from "./Finish";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { ConnectHardwareWelcome } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";
import { ConnectHardwareSearching } from "../../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { useSteps } from "../../../hooks/useSteps";

export const RecoverAccount = ({
  onClose,
  navProps,
}: {
  onClose: () => void;
  navProps: any;
}) => {
  const { step, nextStep, prevStep } = useSteps();
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [onboardedBlockchains, setOnboardedBlockchains] = useState<
    Array<Blockchain>
  >([]);
  const [blockchainKeyrings, setBlockchainKeyrings] = useState<
    Array<BlockchainKeyringInit>
  >([]);

  useEffect(() => {
    (async () => {
      if (username) {
        const response = await fetch(
          `https://auth.xnfts.dev/users/${username}/info`
        );
        const json = await response.json();
        if (response.ok) {
          if (json.publickeys.length > 0) {
            setOnboardedBlockchains(
              json.publickeys.map(
                (b: { blockchain: Blockchain }) => b.blockchain
              )
            );
            // Default to first available blockchain. For mnemonic keyrings we
            // can do this and search all available publickeys for the mnemonic
            // to find a match. For ledger keyrings we need to prompt them to open
            // a specific app on the ledger so we'll allow them to select which
            // blockchain they want to use as part of the flow.
            setBlockchain(json.publickeys[0].blockchain);
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
      onNext={(username: string, publickey: string) => {
        setUsername(username);
        setPublicKey(publickey);
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
    <CreatePassword
      onNext={(password) => {
        setPassword(password);
        nextStep();
      }}
    />,
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
