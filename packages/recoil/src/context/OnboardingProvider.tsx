import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
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

export type OnboardingData = {
  complete: boolean;
  inviteCode: string | undefined;
  username: string | null;
  action: "create" | "import" | "recover" | string;
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

const defaultState = {
  complete: false,
  inviteCode: undefined,
  username: null,
  action: "create",
  keyringType: null,
  blockchain: null,
  password: null,
  mnemonic: undefined,
  blockchainOptions: BLOCKCHAIN_OPTIONS,
  waitlistId: undefined,
  signedWalletDescriptors: [],
  selectedBlockchains: [],
};

type SelectBlockchainType = {
  blockchain: Blockchain;
  background: any;
  onSelectImport?: () => void;
};

type IOnboardingContext = {
  onboardingData: OnboardingData;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  handleSelectBlockchain: (data: SelectBlockchainType) => Promise<void>;
};

const OnboardingContext = createContext<IOnboardingContext>({
  onboardingData: defaultState,
  setOnboardingData: () => {},
  handleSelectBlockchain: async () => {},
});

export function OnboardingProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [data, setData] = useState<OnboardingData>(defaultState);

  const setOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    return setData((oldData) => ({
      ...oldData,
      ...data,
      selectedBlockchains: data.signedWalletDescriptors
        ? [
            ...new Set(
              data.signedWalletDescriptors.map((s: SignedWalletDescriptor) =>
                getBlockchainFromPath(s.derivationPath)
              )
            ),
          ]
        : oldData.selectedBlockchains,
    }));
  }, []);

  const handleSelectBlockchain = useCallback(
    async ({
      blockchain,
      background,
      onSelectImport,
    }: SelectBlockchainType) => {
      const {
        selectedBlockchains,
        signedWalletDescriptors,
        mnemonic,
        keyringType,
        action,
      } = data;

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
          if (onSelectImport) {
            onSelectImport();
          }
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
                Buffer.from(
                  getCreateMessage(walletDescriptor.publicKey),
                  "utf-8"
                )
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
    },
    [data]
  );

  const contextValue = useMemo(
    () => ({
      onboardingData: data,
      setOnboardingData,
      handleSelectBlockchain,
    }),
    [data, setOnboardingData, handleSelectBlockchain]
  );

  return (
    <OnboardingContext.Provider {...props} value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (context === undefined) {
    throw new Error(`useOnboardingData must be used within OnboardingProvider`);
  }

  return context;
}
