import { useState } from "react";
import type {
  KeyringType,
  ServerPublicKey,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  Blockchain,
  BrowserRuntimeExtension,
  getAuthMessage,
  getBlockchainFromPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useSignMessageForWallet,
} from "@coral-xyz/recoil";
import { v4 as uuidv4 } from "uuid";

import { useAuthentication } from "../../../hooks/useAuthentication";
import { useSteps } from "../../../hooks/useSteps";
import { CreatePassword } from "../../common/Account/CreatePassword";
import { MnemonicInput } from "../../common/Account/MnemonicInput";
import { NavBackButton, WithNav } from "../../common/Layout/Nav";
import { getWaitlistId } from "../../common/WaitingRoom";
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
  const background = useBackgroundClient();
  const { authenticate } = useAuthentication();
  const [isValid, setIsValid] = useState(false);
  const { step, nextStep, prevStep } = useSteps();
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [serverPublicKeys, setServerPublicKeys] = useState<
    Array<ServerPublicKey>
  >([]);
  const [signedWalletDescriptors, setSignedWalletDescriptors] = useState<
    Array<SignedWalletDescriptor>
  >([]);
  const authMessage = userId ? getAuthMessage(userId) : "";
  const signMessageForWallet = useSignMessageForWallet(mnemonic);
  const hardwareOnboardSteps = useHardwareOnboardSteps({
    blockchain:
      serverPublicKeys.length > 0
        ? serverPublicKeys[0].blockchain!
        : Blockchain.SOLANA, // TODO refactor out this default requirement
    action: "search",
    searchPublicKey:
      serverPublicKeys.length > 0 ? serverPublicKeys[0].publicKey : undefined,
    signMessage: authMessage,
    signText: "Sign the message to authenticate with Backpack",
    onComplete: (signedWalletDescriptor: SignedWalletDescriptor) => {
      setSignedWalletDescriptors([
        ...signedWalletDescriptors,
        signedWalletDescriptor,
      ]);
      nextStep();
    },
    nextStep,
    prevStep,
  });

  const keyringInit = {
    signedWalletDescriptors,
    mnemonic,
  };

  const inviteCode = undefined; // recover so no invite code

  //
  // Create the user in the backend
  //
  async function createUser(): Promise<{ id: string; jwt: string }> {
    // If userId is provided, then we are onboarding via the recover flow.
    if (userId) {
      // Authenticate the user that the recovery has a JWT.
      // Take the first keyring init to fetch the JWT, it doesn't matter which
      // we use if there are multiple.
      const { derivationPath, publicKey, signature } =
        keyringInit.signedWalletDescriptors[0];
      const authData = {
        blockchain: getBlockchainFromPath(derivationPath),
        publicKey,
        signature,
        message: getAuthMessage(userId),
      };
      const { jwt } = await authenticate(authData!);
      return { id: userId, jwt };
    }

    // If userId is not provided and an invite code is not provided, then
    // this is dev mode.
    if (!inviteCode) {
      return { id: uuidv4(), jwt: "" };
    }

    //
    // If we're down here, then we are creating a user for the first time.
    //
    const body = JSON.stringify({
      username,
      inviteCode,
      waitlistId: getWaitlistId?.(),
      blockchainPublicKeys: keyringInit.signedWalletDescriptors.map((b) => ({
        blockchain: getBlockchainFromPath(b.derivationPath),
        publicKey: b.publicKey,
        signature: b.signature,
      })),
    });

    try {
      const res = await fetch(`${BACKEND_API_URL}/users`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("BB: res created account");

      if (!res.ok) {
        throw new Error(await res.json());
      }
      return await res.json();
    } catch (err) {
      throw new Error("error creating account");
    }
  }

  //
  // Create the local store for the wallets
  //
  async function createStore(uuid: string, jwt: string, password: string) {
    try {
      if (isAddingAccount) {
        console.log("BB: isAddingAccount", isAddingAccount);
        // Add a new account if needed, this will also create the new keyring
        // store
        await background.request({
          method: UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
          params: [username, keyringInit, uuid, jwt],
        });
        console.log("BB: Is: complete");
      } else {
        console.log("BB: isNotAddingAccount");
        // Add a new keyring store under the new account
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
          params: [username, password, keyringInit, uuid, jwt],
        });
        console.log("BB: Not: complete");
      }
      setIsValid(true);
    } catch (err) {
      console.log("BB: account setup error", err);
      if (
        confirm("There was an issue setting up your account. Please try again.")
      ) {
        window.location.reload();
      }
    }
  }

  const steps = [
    <RecoverAccountUsernameForm
      onNext={(
        userId: string,
        username: string,
        serverPublicKeys: Array<ServerPublicKey>
      ) => {
        setUserId(userId);
        setUsername(username);
        setServerPublicKeys(serverPublicKeys);
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
            serverPublicKeys={serverPublicKeys!}
            mnemonic={mnemonic!}
            onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
              const signedWalletDescriptors = await Promise.all(
                walletDescriptors.map(async (w) => ({
                  ...w,
                  signature: await signMessageForWallet(w, authMessage),
                }))
              );
              setSignedWalletDescriptors(signedWalletDescriptors);
              nextStep();
            }}
            onRetry={prevStep}
          />,
        ]
      : hardwareOnboardSteps),
    ...(!isAddingAccount
      ? [
          <CreatePassword
            onNext={async (password) => {
              setPassword(password);
              const { id, jwt } = await createUser();
              await createStore(id, jwt, password);
              nextStep();
            }}
          />,
        ]
      : []),
    ...(signedWalletDescriptors.length > 0 ? [<Finish />] : []),
  ];

  // Cant go backwards from the last step as the keyring is already created
  const isLastStep = step === steps.length - 1;
  // Cant go backwards from the password step as can hit mnemonic search which
  // auto progresses. This could be handled by jumping to a step.
  const isPasswordStep = steps[step].type.name === "CreatePassword";
  // Display message if already onboarded and not on last step
  if (isOnboarded && !isLastStep) {
    return <AlreadyOnboarded />;
  }

  return (
    <WithNav
      navButtonLeft={
        !isLastStep && !isPasswordStep ? (
          <NavBackButton onClick={step > 0 ? prevStep : onClose} />
        ) : undefined
      }
      {...navProps}
      // Only display the onboarding menu on the first step
      navButtonRight={undefined}
    >
      {steps[step]}
    </WithNav>
  );
};
