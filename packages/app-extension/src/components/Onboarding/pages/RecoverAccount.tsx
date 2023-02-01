import { useEffect, useState } from "react";
import type {
  Blockchain,
  KeyringType,
  PublicKeyPath,
  SignedPublicKeyPath,
} from "@coral-xyz/common";
import { BACKEND_API_URL, getAuthMessage } from "@coral-xyz/common";

import { useOnboarding } from "../../../hooks/useOnboarding";
import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
// import { BlockchainSelector } from "./BlockchainSelector";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { useHardwareOnboardSteps } from "../../Onboarding/pages/HardwareOnboard";

import { AlreadyOnboarded } from "./AlreadyOnboarded";
import { Finish } from "./Finish";
import { KeyringTypeSelector } from "./KeyringTypeSelector";
import { MnemonicSearch } from "./MnemonicSearch";
import { RecoverAccountUsernameForm } from "./RecoverAccountUsernameForm";

export const RecoverAccount = ({
  onClose,
  navProps,
  isAddingAccount,
  isOnboarded,
}: {
  onClose: () => void;
  navProps: any;
  isAddingAccount?: boolean;
  isOnboarded?: boolean;
}) => {
  const { step, nextStep, prevStep } = useSteps();

  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const authMessage = userId ? getAuthMessage(userId) : "";

  const { addSignedPublicKeyPath, keyringInit, signMessageForWallet } =
    useOnboarding(mnemonic);

  const hardwareOnboardSteps = useHardwareOnboardSteps({
    blockchain: blockchain!,
    action: "search",
    searchPublicKey: publicKey!,
    signMessage: authMessage,
    signText: "Sign the message to authenticate with Backpack",
    onComplete: (signedPublicKeyPath: SignedPublicKeyPath) => {
      addSignedPublicKeyPath(signedPublicKeyPath);
      nextStep();
    },
    nextStep,
    prevStep,
  });

  useEffect(() => {
    (async () => {
      if (username) {
        const response = await fetch(`${BACKEND_API_URL}/users/${username}`);
        const json = await response.json();
        if (response.ok) {
          setUserId(json.id);
          if (json.publicKeys.length > 0) {
            // Default to first available blockchain for recovery
            setBlockchain(json.publicKeys[0].blockchain);
          }
        }
      }
    })();
  }, [username]);

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
            onNext={async (publicKeyPath: PublicKeyPath) => {
              const signature = await signMessageForWallet(
                blockchain!,
                publicKeyPath,
                authMessage
              );
              addSignedPublicKeyPath({
                ...publicKeyPath,
                signature,
              });
              nextStep();
            }}
            onRetry={prevStep}
          />,
        ]
      : hardwareOnboardSteps),
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
    ...(keyringInit.signedPublicKeyPaths.length > 0
      ? [
          <Finish
            inviteCode={undefined} // Recovery so no invite code
            userId={userId}
            username={username}
            password={password!}
            keyringInit={keyringInit!}
            isAddingAccount={isAddingAccount}
          />,
        ]
      : []),
  ];

  if (isOnboarded && step !== steps.length - 1) {
    return <AlreadyOnboarded />;
  }

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
