// TODO(peter) move all the RPC/onboarding function shit here & out of every individual screen (eventually)
import type { BlockchainKeyringInit, KeyringType } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { createContext, useContext, useState } from "react";

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

export type OnboardingAction = "import" | "create" | "recover"; // TODO(peter) move to OnboardingProvider
export type OnboardingData = {
  complete: boolean;
  inviteCode: string | undefined;
  username: string | null;
  action: string | null; // TODO consider this default of 'welcome' maybe
  keyringType: KeyringType | null;
  blockchainKeyrings: BlockchainKeyringInit[];
  blockchain: Blockchain | null;
  password: string | null;
  mnemonic: string | undefined;
  blockchainOptions: BlockchainSelectOption[];
  waitlistId: string | undefined;
};

const defaults = {
  complete: false,
  inviteCode: undefined,
  username: null,
  action: null,
  keyringType: null,
  blockchainKeyrings: [],
  blockchain: null,
  password: null,
  mnemonic: undefined,
  blockchainOptions: BLOCKCHAIN_OPTIONS,
  waitlistId: undefined,
};

const OnboardingContext = createContext<{
  onboardingData: OnboardingData;
  setOnboardingData:(data: Partial<OnboardingData>) => void;
}>({
  onboardingData: defaults,
  setOnboardingData: (_data: Partial<OnboardingData>) => {},
});

function OnboardingProvider({ children, ...props }: { children: JSX.Element }) {
  const [onboardingData, setData] = useState<OnboardingData>(defaults);
  const setOnboardingData = (data: Partial<OnboardingData>) =>
    setData((oldData) => ({ ...oldData, ...data }));

  return (
    <OnboardingContext.Provider
      value={{ onboardingData, setOnboardingData }}
      {...props}
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
