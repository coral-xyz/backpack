import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  KeyringType,
  ServerPublicKey,
  SignedWalletDescriptor,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  Blockchain,
  getAuthMessage,
  getCreateMessage,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
} from "@coral-xyz/common";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";

import { useBackgroundClient } from "../hooks/client";
import { useAuthentication } from "../hooks/useAuthentication";
const { base58 } = ethers.utils;

export const getWaitlistId = () => {
  if (window?.localStorage) {
    const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";
    return window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;
  }

  return undefined;
};

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
  userId: string | undefined;
  complete: boolean;
  inviteCode: string | undefined;
  username: string | null;
  action: string;
  keyringType: KeyringType | null;
  blockchain: Blockchain | null;
  password: string | null;
  mnemonic: string | undefined;
  blockchainOptions: BlockchainSelectOption[];
  waitlistId: string | undefined;
  signedWalletDescriptors: SignedWalletDescriptor[];
  isAddingAccount?: boolean;
  selectedBlockchains: Blockchain[];
  serverPublicKeys: ServerPublicKey[];
};

const defaultState = {
  userId: undefined,
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
  serverPublicKeys: [],
};

type SelectBlockchainType = {
  blockchain: Blockchain;
  onSelectImport?: () => void;
};

type IOnboardingContext = {
  onboardingData: OnboardingData;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  handleSelectBlockchain: (data: SelectBlockchainType) => Promise<void>;
  maybeCreateUser: (data: Partial<OnboardingData>) => Promise<{ ok: boolean }>;
};

const OnboardingContext = createContext<IOnboardingContext>({
  onboardingData: defaultState,
  setOnboardingData: () => {},
  handleSelectBlockchain: async () => {},
  maybeCreateUser: async () => ({ ok: true }),
});

export function OnboardingProvider({
  children,
  ...props
}: {
  children: JSX.Element;
}) {
  const background = useBackgroundClient();
  const { authenticate } = useAuthentication();
  const [data, setData] = useState<OnboardingData>(defaultState);

  const setOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    return setData((oldData) => ({
      ...oldData,
      ...data,
      selectedBlockchains: data.signedWalletDescriptors
        ? [
            ...new Set(
              data.signedWalletDescriptors.map(
                (s: SignedWalletDescriptor) => s.blockchain
              )
            ),
          ]
        : oldData.selectedBlockchains,
    }));
  }, []);

  const handleSelectBlockchain = useCallback(
    async ({ blockchain, onSelectImport }: SelectBlockchainType) => {
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
            (s) => s.blockchain !== blockchain
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

  //
  // Create the user in the backend
  //
  const createUser = useCallback(
    async (data: Partial<OnboardingData>) => {
      const { inviteCode, userId, username, mnemonic } = data;

      const keyringInit = {
        signedWalletDescriptors: data.signedWalletDescriptors!,
        mnemonic,
      };

      //
      // If userId is provided, then we are onboarding via the recover flow.
      if (userId) {
        // Authenticate the user that the recovery has a JWT.
        // Take the first keyring init to fetch the JWT, it doesn't matter which
        // we use if there are multiple.
        const { blockchain, publicKey, signature } =
          keyringInit.signedWalletDescriptors[0];

        const authData = {
          blockchain: blockchain!,
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
        blockchainPublicKeys: keyringInit.signedWalletDescriptors,
      });

      try {
        const res = await fetch(`${BACKEND_API_URL}/users`, {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(await res.json());
        }
        return await res.json();
      } catch (err) {
        console.error("OnboardingProvider:createUser::error", err);
        throw new Error(`error creating user`);
      }
    },
    [data]
  );

  //
  // Create the local store for the wallets
  //
  const createStore = useCallback(
    async (uuid: string, jwt: string, data: Partial<OnboardingData>) => {
      const { isAddingAccount, username, mnemonic, password } = data;

      const keyringInit = {
        signedWalletDescriptors: data.signedWalletDescriptors!,
        mnemonic,
      };

      try {
        if (isAddingAccount) {
          // Add a new account if needed, this will also create the new keyring
          // store
          await background.request({
            method: UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
            params: [username, keyringInit, uuid, jwt],
          });
        } else {
          // Add a new keyring store under the new account
          await background.request({
            method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
            params: [username, password, keyringInit, uuid, jwt],
          });
        }
      } catch (err) {
        console.error("OnboardingProvider:createStore::error", err);
        throw new Error(`error creating account`);
      }
    },
    [data]
  );

  const maybeCreateUser = useCallback(
    async (data: Partial<OnboardingData>) => {
      try {
        const { id, jwt } = await createUser(data);
        await createStore(id, jwt, data);
        return { ok: true };
      } catch (err) {
        console.error("OnboardingProvider:maybeCreateUser::error", err);
        return { ok: false };
      }
    },
    [data]
  );

  const contextValue = useMemo(
    () => ({
      onboardingData: data,
      setOnboardingData,
      handleSelectBlockchain,
      maybeCreateUser,
    }),
    [data, setOnboardingData, handleSelectBlockchain, maybeCreateUser]
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
