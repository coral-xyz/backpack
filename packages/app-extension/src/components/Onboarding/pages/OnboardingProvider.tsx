// TODO(peter) move all the RPC/onboarding function shit here & out of every individual screen (eventually)
import { createContext, useContext, useState } from "react";
import type { KeyringType, SignedWalletDescriptor } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";

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
};

const OnboardingContext = createContext<{
  onboardingData: OnboardingData;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
}>({
  // @ts-ignore
  onboardingData: defaults,
  setOnboardingData: (_data: Partial<OnboardingData>) => {},
});

function OnboardingProvider({ children, ...props }: { children: JSX.Element }) {
  // @ts-ignore
  const [data, setData] = useState<OnboardingData>(defaults);
  const setOnboardingData = (data: Partial<OnboardingData>) =>
    setData((oldData) => ({ ...oldData, ...data }));

  return (
    <OnboardingContext.Provider
      value={{ onboardingData: data, setOnboardingData }}
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
