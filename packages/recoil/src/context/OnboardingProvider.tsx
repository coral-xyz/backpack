import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  KeyringType,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
  PrivateKeyWalletDescriptor,
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
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
} from "@coral-xyz/common";

import { useBackgroundClient } from "../hooks/client";
import { useAuthentication } from "../hooks/useAuthentication";
import { useRpcRequests } from "../hooks/useRpcRequests";

// for mobile, just leave for now
const logger =
  (
    prefix = "" // eslint-disable-line
  ) =>
  (...args: any) => {
    // eslint-disable-line
    if (false!) {
      console.log(prefix, ...args);
    }
  };

const maybeLog = logger("op1");

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
  // Wallet descriptors are for onboarding with mnemonic or ledger
  signedWalletDescriptors: SignedWalletDescriptor[];
  // Private key wallet descriptor is for onboarding with private key
  privateKeyKeyringInit: PrivateKeyKeyringInit | null;
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
  privateKey: undefined,
  blockchainOptions: BLOCKCHAIN_OPTIONS,
  waitlistId: undefined,
  signedWalletDescriptors: [],
  privateKeyKeyringInit: null,
  selectedBlockchains: [],
  serverPublicKeys: [],
};

type SelectBlockchainType = {
  blockchain: Blockchain;
  onStatus?: (status: string) => void;
};

type IOnboardingContext = {
  onboardingData: OnboardingData;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  handleSelectBlockchain: (data: SelectBlockchainType) => Promise<void>;
  maybeCreateUser: (
    data: Partial<OnboardingData>
  ) => Promise<{ ok: boolean; jwt: string }>;
  handlePrivateKeyInput: (data: PrivateKeyWalletDescriptor) => Promise<void>;
};

const OnboardingContext = createContext<IOnboardingContext>({
  onboardingData: defaultState,
  setOnboardingData: () => {},
  handleSelectBlockchain: async () => {},
  maybeCreateUser: async () => ({ ok: true, jwt: "" }),
  handlePrivateKeyInput: async () => {},
});

export function OnboardingProvider({
  children,
  ...props
}: {
  children: JSX.Element;
}) {
  const background = useBackgroundClient();
  const { authenticate } = useAuthentication();
  const { signMessageForWallet } = useRpcRequests();
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
    async ({ blockchain, onStatus }: SelectBlockchainType) => {
      const handleStatus = (status: string) => {
        if (onStatus) {
          onStatus(status);
        }
      };

      const {
        selectedBlockchains,
        signedWalletDescriptors,
        mnemonic,
        keyringType,
        action,
      } = data;

      if (selectedBlockchains.includes(blockchain)) {
        handleStatus("deselected");
        // Blockchain is being deselected
        setOnboardingData({
          blockchain: null,
          signedWalletDescriptors: signedWalletDescriptors.filter(
            (s) => s.blockchain !== blockchain
          ),
        });
      } else {
        handleStatus("selected");
        // Blockchain is being selected
        if (
          keyringType === "ledger" ||
          action === "import" ||
          keyringType === "private-key"
        ) {
          handleStatus(`keyringType:${keyringType}, action:${action}`);
          setOnboardingData({ blockchain });
        } else if (action === "create") {
          handleStatus("action create");
          try {
            const walletDescriptor = await background.request({
              method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
              params: [blockchain, 0, mnemonic],
            });

            handleStatus("wallet descriptor found");

            const signature = await signMessageForWallet(
              blockchain,
              walletDescriptor.publicKey,
              getCreateMessage(walletDescriptor.publicKey),
              {
                mnemonic,
                signedWalletDescriptors: [
                  { ...walletDescriptor, signature: "" },
                ],
              }
            );

            handleStatus("signature gotten");

            setOnboardingData({
              signedWalletDescriptors: [
                ...signedWalletDescriptors,
                {
                  ...walletDescriptor,
                  signature,
                },
              ],
            });
          } catch (err) {
            console.error(err);
            handleStatus(err);
          }
        }
      }
    },
    [data, background, setOnboardingData, signMessageForWallet]
  );

  const handlePrivateKeyInput = useCallback(
    async ({
      blockchain,
      publicKey,
      privateKey,
    }: {
      blockchain: Blockchain;
      publicKey: string;
      privateKey: string;
    }) => {
      setOnboardingData({ blockchain });
      const signature = await signMessageForWallet(
        blockchain,
        publicKey,
        // Recover or create
        data.userId ? getAuthMessage(data.userId) : getCreateMessage(publicKey),
        { blockchain, publicKey, privateKey, signature: "" }
      );

      setOnboardingData({
        privateKeyKeyringInit: {
          blockchain,
          publicKey,
          privateKey,
          signature,
        },
      });
    },
    [data, setOnboardingData, signMessageForWallet]
  );

  const getKeyringInit = useCallback(
    (
      data: Partial<OnboardingData>
    ): MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit => {
      if (data.keyringType === "private-key") {
        return data.privateKeyKeyringInit!;
      } else if (data.keyringType === "ledger") {
        return {
          signedWalletDescriptors: data.signedWalletDescriptors!,
        };
      } else {
        return {
          signedWalletDescriptors: data.signedWalletDescriptors!,
          mnemonic: data.mnemonic,
        };
      }
    },
    []
  );

  //
  // Create the user in the backend
  //
  const createUser = useCallback(
    async (data: Partial<OnboardingData>) => {
      maybeLog("createUser:data", data);
      const { inviteCode, userId, username, keyringType } = data;

      // If userId is provided, then we are onboarding via the recover flow.
      if (userId) {
        maybeLog("createUser:userId", userId);
        // Authenticate the user that the recovery has a JWT.
        // Take the first keyring init to fetch the JWT, it doesn't matter which
        // we use if there are multiple.
        const { blockchain, publicKey, signature } =
          keyringType === "private-key"
            ? data.privateKeyKeyringInit!
            : data.signedWalletDescriptors![0];

        const authData = {
          blockchain: blockchain!,
          publicKey,
          signature,
          message: getAuthMessage(userId),
        };

        maybeLog("createUser:authData", authData);

        const { jwt } = await authenticate(authData!);
        return { id: userId, jwt };
      }

      // Signed blockchain public keys for POST to the server
      const blockchainPublicKeys =
        keyringType === "private-key"
          ? [data.privateKeyKeyringInit]
          : data.signedWalletDescriptors;

      // If we're down here, then we are creating a user for the first time.
      const body = JSON.stringify({
        username,
        inviteCode,
        waitlistId: getWaitlistId?.(),
        blockchainPublicKeys,
      });

      maybeLog("createUser:body", body);

      try {
        const res = await fetch(`${BACKEND_API_URL}/users`, {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        });

        maybeLog("createUser:res", res);
        const json = await res.json();
        maybeLog("createUser:json", json);

        if (!res.ok) {
          throw new Error(json);
        }

        return json;
      } catch (err) {
        console.error("OnboardingProvider:createUser", err);
        throw new Error(`createUser:error:${err.message}`);
      }
    },
    [authenticate]
  );

  //
  // Create the local store for the wallets
  //
  const createStore = useCallback(
    async (uuid: string, jwt: string, data: Partial<OnboardingData>) => {
      const { isAddingAccount, username, password } = data;
      maybeLog("createStore:data", data);

      const keyringInit = getKeyringInit(data);
      maybeLog("createStore:isAddingAccount:keyringInit", keyringInit);
      maybeLog("createStore:isAddingAccount:username", username);

      try {
        if (isAddingAccount) {
          maybeLog("createStore:isAddingAccount", isAddingAccount);
          // Add a new account if needed, this will also create the new keyring
          // store
          const res = await background.request({
            method: UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
            params: [username, keyringInit, uuid, jwt],
          });
          maybeLog("createStore:isAddingAccount:res", res);
        } else {
          maybeLog("createStore:else", username);
          // Add a new keyring store under the new account
          await background.request({
            method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
            params: [username, password, keyringInit, uuid, jwt],
          });
        }
      } catch (err) {
        console.error("OnboardingProvider:createStore", err);
        throw new Error(`createStore:error:${err.message}`);
      }
    },
    [background, getKeyringInit]
  );

  const maybeCreateUser = useCallback(
    async (data: Partial<OnboardingData>) => {
      try {
        const { id, jwt } = await createUser(data);
        await createStore(id, jwt, data);
        return { ok: true, jwt };
      } catch (err) {
        console.error("OnboardingProvider:maybeCreateUser", err);
        return { ok: false, jwt: "" };
      }
    },
    [createStore, createUser]
  );

  const contextValue = useMemo(
    () => ({
      onboardingData: data,
      setOnboardingData,
      handleSelectBlockchain,
      handlePrivateKeyInput,
      maybeCreateUser,
    }),
    [
      data,
      setOnboardingData,
      handleSelectBlockchain,
      handlePrivateKeyInput,
      maybeCreateUser,
    ]
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
