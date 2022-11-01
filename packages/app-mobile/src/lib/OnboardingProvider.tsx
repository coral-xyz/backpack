// TODO(peter) move all the RPC/onboarding function shit here & out of every individual screen (eventually)
import { useContext, createContext, useState } from "react";
import type {
  Blockchain,
  KeyringType,
  BlockchainKeyringInit,
} from "@coral-xyz/common";

const BLOCKCHAIN_OPTIONS = [
  {
    name: "Ethereum",
    enabled: true,
  },
  {
    name: "Solana",
    enabled: true,
  },
  {
    name: "Polygon",
    enabled: false,
  },
  {
    name: "BSC",
    enabled: false,
  },
  {
    name: "Avalanche",
    enabled: false,
  },
  {
    name: "Cosmos",
    enabled: false,
  },
];

export type OnboardingAction = "import" | "create" | "recover"; // TODO(peter) move to OnboardingProvider
export type OnboardingData = {
  inviteCode: string | undefined;
  username: string | null;
  action: string | null; // TODO consider this default of 'welcome' maybe
  keyringType: KeyringType | null;
  blockchainKeyrings: BlockchainKeyringInit[];
  blockchain: Blockchain | null;
  password: string | null;
  mnemonic: string | undefined;
  blockchainOptions: Array<{ name: string; enabled: boolean }>;
  waitlistId: string | undefined;
};

const defaults = {
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
  setOnboardingData: (data: Partial<OnboardingData>) => void;
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
