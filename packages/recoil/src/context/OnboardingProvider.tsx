import type {
  KeyringType,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
  PrivateKeyWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import type {
  BlockchainWalletDescriptor,
  BlockchainWalletDescriptorType,
  BlockchainWalletInit,
} from "@coral-xyz/secure-background/types";
import {
  BlockchainWalletInitType,
  BlockchainWalletPreviewType,
} from "@coral-xyz/secure-background/types";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRecoilValue } from "recoil";
import { v4 } from "uuid";

import { secureBackgroundSenderAtom, userClientAtom } from "../atoms";
import { useBackgroundClient } from "../hooks/client";

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
];

type KeyringData = {
  keyringType: KeyringType;
  privateKeyKeyringInit?: PrivateKeyKeyringInit;
  signedWalletDescriptors?: WalletDescriptor[];
  mnemonic?: string;
};

// if adding an account, password not required
type BaseData = {
  accountName?: string;
  password?: string;
  isAddingAccount: boolean;
};

export type OnboardData = KeyringData & BaseData;

export type OnboardingData = {
  accountName?: string;
  complete: boolean;
  action: "create" | "import" | "recover_backpack_backup";
  keyringType: KeyringType | null;
  blockchain: Blockchain | null;
  password: string | null;
  mnemonic?: string;
  blockchainOptions: BlockchainSelectOption[];
  // Wallet descriptors are for onboarding with mnemonic or ledger
  signedWalletDescriptors: WalletDescriptor[];
  // Private key wallet descriptor is for onboarding with private key
  privateKeyKeyringInit: PrivateKeyKeyringInit | null;
  isAddingAccount?: boolean;
  selectedBlockchains: Blockchain[];
};

const defaultState: OnboardingData = {
  accountName: undefined,
  complete: false,
  action: "create",
  keyringType: null,
  blockchain: null,
  password: null,
  mnemonic: undefined,
  blockchainOptions: BLOCKCHAIN_OPTIONS,
  signedWalletDescriptors: [],
  privateKeyKeyringInit: null,
  selectedBlockchains: [],
};

type SelectBlockchainType = {
  blockchain: Blockchain;
};

type IOnboardingContext = {
  onboardingData: OnboardingData;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  handleSelectBlockchain: (data: SelectBlockchainType) => Promise<void>;
  createStore: (
    data: Partial<OnboardingData>
  ) => Promise<{ ok: boolean; jwt: string }>;
  handlePrivateKeyInput: (data: PrivateKeyWalletDescriptor) => Promise<void>;
  connectHardware: (
    uuid: string,
    data: Partial<OnboardingData>
  ) => Promise<{ ok: boolean }>;
};

const OnboardingContext = createContext<IOnboardingContext>({
  onboardingData: defaultState,
  setOnboardingData: () => {},
  handleSelectBlockchain: async () => {},
  createStore: async () => ({ ok: true, jwt: "" }),
  handlePrivateKeyInput: async () => {},
  connectHardware: async () => ({ ok: true }),
});

export function OnboardingProvider({
  children,
  ...props
}: {
  children: JSX.Element;
}) {
  const userClient = useRecoilValue(userClientAtom);
  const [data, setData] = useState<OnboardingData>(defaultState);

  const setOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    return setData((oldData) => ({
      ...oldData,
      ...data,
      selectedBlockchains: data.signedWalletDescriptors
        ? [
            ...new Set(
              data.signedWalletDescriptors.map(
                (s: WalletDescriptor) => s.blockchain
              )
            ),
          ]
        : oldData.selectedBlockchains,
    }));
  }, []);

  const handleSelectBlockchain = useCallback(
    async ({ blockchain }: SelectBlockchainType) => {
      const {
        selectedBlockchains,
        signedWalletDescriptors,
        mnemonic,
        keyringType,
        action,
      } = data;
      if (selectedBlockchains.includes(blockchain)) {
        // setOnboardingData({
        //   // blockchain: null,
        //   // signedWalletDescriptors: signedWalletDescriptors.filter(
        //   //   (s) => s.blockchain !== blockchain
        //   // ),
        // });
      } else {
        // Blockchain is being selected

        // TODO: we shouldn't use the same handler for both paths here.
        if (
          keyringType === "trezor" ||
          keyringType === "ledger" ||
          action === "import" ||
          keyringType === "private-key"
        ) {
          setOnboardingData({ blockchain });
        } else if (action === "create") {
          try {
            const wallets = await safeClientResponse(
              userClient.previewWallets({
                type: BlockchainWalletPreviewType.MNEMONIC_NEXT,
                blockchain,
                mnemonic,
              })
            );
            const walletDescriptors = wallets.wallets[0]
              .walletDescriptors as BlockchainWalletDescriptor<BlockchainWalletDescriptorType.MNEMONIC>[];

            setOnboardingData({
              signedWalletDescriptors: [
                ...signedWalletDescriptors,
                ...walletDescriptors,
              ],
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
    },
    [data, setOnboardingData, userClient]
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
      setOnboardingData({
        blockchain,
        privateKeyKeyringInit: {
          blockchain,
          publicKey,
          privateKey,
        },
      });
    },
    [setOnboardingData]
  );

  const getKeyringInit = useCallback(
    (
      data: KeyringData
    ): MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit => {
      if (data.keyringType === "private-key") {
        return data.privateKeyKeyringInit!;
      } else if (
        data.keyringType === "ledger" ||
        data.keyringType === "trezor"
      ) {
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

  const getBlockchainWalletInits = useCallback(
    (data: KeyringData): BlockchainWalletInit[] => {
      if (data.keyringType === "private-key") {
        data.privateKeyKeyringInit;
        return [
          {
            type: BlockchainWalletInitType.PRIVATEKEY,
            ...data.privateKeyKeyringInit!,
          },
        ];
      } else if (data.keyringType === "ledger") {
        return data.signedWalletDescriptors!.map((descriptor) => ({
          type: BlockchainWalletInitType.HARDWARE,
          device: "ledger",
          ...descriptor,
        }));
      } else if (data.keyringType === "trezor") {
        return data.signedWalletDescriptors!.map((descriptor) => ({
          type: BlockchainWalletInitType.HARDWARE,
          device: "trezor",
          ...descriptor,
        }));
      } else {
        return data.signedWalletDescriptors!.map((descriptor) => ({
          type: BlockchainWalletInitType.MNEMONIC,
          mnemonic: data.mnemonic,
          ...descriptor,
        }));
      }
    },
    []
  );

  const connectHardware = useCallback(
    async (uuid: string, data: OnboardData) => {
      const blockchainWalletInits = getBlockchainWalletInits(data);
      try {
        await userClient.initWallet({
          uuid,
          blockchainWalletInits,
        });
      } catch (err: any) {
        throw new Error(`createStore:usernameCreate:${err.message}`);
      }
      return { ok: true };
    },
    []
  );

  //
  // Create the local store for the wallets
  //
  const createStore = useCallback(
    async (data: OnboardData) => {
      try {
        const uuid = v4();
        const jwt = "";
        // const keyringInit = getKeyringInit(data);
        const blockchainWalletInits = getBlockchainWalletInits(data);

        if (data.isAddingAccount) {
          // Add a new account if needed, also creates new keyring store
          try {
            await userClient.initWallet({
              uuid,
              accountName: data.accountName,
              blockchainWalletInits,
            });
          } catch (err: any) {
            throw new Error(`createStore:usernameCreate:${err.message}`);
          }
        } else {
          // Add a new keyring store under the new account
          try {
            await userClient.initWallet({
              uuid,
              accountName: data.accountName,
              password: data.password,
              blockchainWalletInits,
            });
          } catch (err: any) {
            throw new Error(`createStore:keyringStoreCreate:${err.message}`);
          }
        }

        return { ok: true, jwt };
      } catch (err: any) {
        console.error("OnboardingProvider:maybeCreateUser", err);
        return { ok: false, jwt: "" };
      }
    },
    [getBlockchainWalletInits, userClient]
  );

  const contextValue = useMemo(
    () => ({
      onboardingData: data,
      setOnboardingData,
      handleSelectBlockchain,
      handlePrivateKeyInput,
      createStore,
      connectHardware,
    }),
    [
      data,
      setOnboardingData,
      handleSelectBlockchain,
      handlePrivateKeyInput,
      createStore,
      connectHardware,
    ]
  );

  return (
    // @ts-ignore
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
