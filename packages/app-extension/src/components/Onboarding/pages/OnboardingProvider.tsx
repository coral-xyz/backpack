// @ts-nocheck
import { createContext, useContext, useState } from "react";
import type { KeyringType, SignedWalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  getBlockchainFromPath,
  getCreateMessage,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { ethers } from "ethers";
const { base58 } = ethers.utils;

type BlockchainSelectOption = {
  id: string;
  label: string;
  enabled: boolean;
};

const BLOCKCHAIN_OPTIONS: BlockchainSelectOption[] = [
  {
    id: Blockchain.ETHEREUM,
    label: "Ethereum",
    enabled: true,
  },
  {
    id: Blockchain.SOLANA,
    label: "Solana",
    enabled: true,
  },
  {
    id: "polygon",
    label: "Polygon",
    enabled: false,
  },
  {
    id: "bsc",
    label: "BSC",
    enabled: false,
  },
  {
    id: "avalanche",
    label: "Avalanche",
    enabled: false,
  },
  {
    id: "cosmos",
    label: "Cosmos",
    enabled: false,
  },
];

export type OnboardingAction = "import" | "create" | "recover";
export type OnboardingData = {
  complete: boolean;
  inviteCode: string | undefined;
  username: string | null;
  action: OnboardingAction;
  keyringType: KeyringType | null;
  blockchain: Blockchain | null;
  password: string | null;
  mnemonic: string | undefined;
  blockchainOptions: BlockchainSelectOption[];
  waitlistId: string | undefined;
  signedWalletDescriptors: SignedWalletDescriptor[];
  userId?: string;
  isAddingAccount?: boolean;
  selectedBlockchains: Blockchain[];
};

const defaults = {
  complete: false,
  inviteCode: undefined,
  username: "testing__",
  action: "import", // TODO
  keyringType: null,
  blockchain: null,
  password: null,
  mnemonic: undefined,
  blockchainOptions: BLOCKCHAIN_OPTIONS,
  waitlistId: undefined,
  signedWalletDescriptors: [],
  selectedBlockchains: [],
};

const OnboardingContext = createContext();

function OnboardingProvider({ children, ...props }: { children: any }) {
  const [data, setData] = useState<OnboardingData>(defaults);

  const setOnboardingData = (data: Partial<OnboardingData>) => {
    return setData((oldData) => ({
      ...oldData,
      ...data,
    }));
  };

  const handleSelectBlockchain = async (
    { blockchain, selectedBlockchains, background }: any,
    cb
  ) => {
    const { signedWalletDescriptors, mnemonic, keyringType, action } = data;
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setOnboardingData({
        blockchain: null,
        signedWalletDescriptors: signedWalletDescriptors.filter(
          (s) => getBlockchainFromPath(s.derivationPath) !== blockchain
        ),
      });
    } else {
      // Blockchain is being selected
      if (keyringType === "ledger" || action === "import") {
        // If wallet is a ledger, step through the ledger onboarding flow
        // OR if action is an import then open the drawer with the import accounts
        // component
        setOnboardingData({ blockchain });
        cb();
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

        setOnboardingData({
          signedWalletDescriptors: [
            ...signedWalletDescriptors,
            {
              ...walletDescriptor,
              signature,
            },
          ],
        });
      }
    }
  };

  return (
    <OnboardingContext.Provider
      {...props}
      value={{
        onboardingData: data,
        setOnboardingData,
        handleSelectBlockchain,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

function useOnboardingData() {
  const context = useContext(OnboardingContext);

  if (context === undefined) {
    throw new Error(`useOnboardingData must be used within OnboardingProvider`);
  }

  return context;
}

export { OnboardingProvider, useOnboardingData };
