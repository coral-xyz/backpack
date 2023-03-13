import type { Commitment } from "@solana/web3.js";

export type Context<Backend> = {
  sender: Sender;
  backend: Backend;
  events: EventEmitter;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type RpcResponse<T = any> = any;

export type Notification = {
  name: string;
  data?: any;
};

export type EventHandler = (notif: any) => void;
export type EventEmitter = any;
export type ResponseHandler = [any, any];
export type Event = any;

export type RpcRequest = {
  id?: number;
  method: string;
  params: any[];
};

export type RpcRequestMsg = {
  channel: string;
  data: {
    id: string;
    method: string;
    params: any[];
  };
};

// NOTE(peter) don't want to fk with RpcResponse<T> for now
export type RpcResponseData = {
  id?: string;
  error?: any;
  result?: any;
};

export enum Blockchain {
  SOLANA = "solana",
  ETHEREUM = "ethereum",
}

export type RecentTransaction = {
  blockchain: Blockchain;
  date: Date;
  signature: string;
  didError: boolean;
};

export type NftCollection = {
  id: string;
  metadataCollectionId: string;
  symbol: string;
  tokenType: string;
  totalSupply: string;
  itemIds: Array<string>;
  items?: { [id: string]: Nft }; // Not expected to be defined. Eth only.
};

export type Nft = {
  id: string;
  blockchain: Blockchain;
  name: string;
  description: string;
  externalUrl: string;
  imageUrl: string;
  imageData?: string;
  attributes?: NftAttribute[];
  mint?: string;
  collectionName: string;
  metadataCollectionId?: string;
  tokenId?: string; // Ethereum only.
  contractAddress?: string; // Ethereum only.
  lockScreenImageUrl?: string; // MadLads only.
};

export type SolanaNft = Nft & {
  publicKey: string;
  mint: string;
};

export type EthereumNft = Nft & {
  contractAddress: string;
  tokenId: string;
};

export type NftAttribute = {
  traitType: string;
  value: string;
};

export type KeyringType = "mnemonic" | "ledger" | "private-key";

export type MnemonicKeyringInit = {
  signedWalletDescriptors: Array<SignedWalletDescriptor>;
  // true is for indicating the backend should just load the existing
  // keyring mnemonic
  mnemonic: string | true;
};

export type LedgerKeyringInit = {
  signedWalletDescriptors: Array<SignedWalletDescriptor>;
};

export type PrivateKeyKeyringInit = {
  signature: string;
} & PrivateKeyWalletDescriptor;

// Location of a public key including the public key
export type WalletDescriptor = {
  blockchain: Blockchain;
  publicKey: string;
  derivationPath: string;
};

// Path to a public key including a signature from the public key
export type SignedWalletDescriptor = {
  signature: string;
} & WalletDescriptor;

export type PrivateKeyWalletDescriptor = {
  blockchain: Blockchain;
  publicKey: string;
  privateKey: string;
};

// The way public keys are stored on the API
export type ServerPublicKey = {
  blockchain: Blockchain;
  publicKey: string;
  primary?: boolean;
};

export type NamedPublicKey = {
  blockchain: Blockchain;
  name: string;
};

export interface XnftPreference {
  disabled: boolean;
  mediaPermissions: boolean;
  pushNotifications: boolean;
}

export interface XnftMetadata {
  isDarkMode: boolean;
  username?: string;
  userId: string;
  avatarUrl: string;
  jwt?: string;
  version: number;
}

export type XnftPreferenceStore = { [key: string]: XnftPreference };

/////////////////////////////////////////////////////////////////////////////////
// TODO: The types here should be elsewhere (e.g. in
//       packages/blockchains/keyring) or packages/backend/src/store
//       but we need to refactor those packages a bit to avoid cyclic deps.
/////////////////////////////////////////////////////////////////////////////////

export type BlockchainKeyringJson = {
  hdKeyring: HdKeyringJson;
  importedKeyring: KeyringJson;
  ledgerKeyring: LedgerKeyringJson;
  activeWallet: string;
  deletedWallets: Array<string>;
};

export type KeyringJson = {
  secretKeys: Array<string>;
};

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  derivationPaths: Array<string>;
  accountIndex?: number;
  walletIndex?: number;
};

export type LedgerKeyringJson = {
  walletDescriptors: Array<WalletDescriptor>;
};

export type SolanaFeeConfig = { computeUnits: number; priorityFee: bigint };
export type FeeConfig = SolanaFeeConfig;

export type Preferences = {
  autoLockSettings: AutolockSettings;
  approvedOrigins: string[];
  darkMode: boolean;
  developerMode: boolean;
  aggregateWallets: boolean;
  solana: SolanaData;
  ethereum: EthereumData;
} & DeprecatedWalletDataDoNotUse;

export type AutolockSettingsOption = "never" | "onClose" | undefined;
export type AutolockSettings = {
  seconds?: number;
  option?: AutolockSettingsOption;
};

// Legacy types. Don't use these.
export type DeprecatedWalletDataDoNotUse = {
  username?: string;
  autoLockSecs?: number; // Used in releases <=0.4.0
};

type SolanaData = {
  explorer: string;
  commitment: Commitment;
  cluster: string;
};

type EthereumData = {
  explorer: string;
  connectionUrl: string;
  chainId: string;
};

// Sender is the trusted descriptor of the sender of a message into
// the service worker. This is provided as part of the API from the
// chrome.runtime APIs.
//
// See https://developer.chrome.com/docs/extensions/reference/runtime/#type-MessageSender
export type Sender = {
  id: string; // This is the extension id, if applicable.
  url: string;

  origin?: string;

  documentId?: string;
  documentLifeCycle?: string;
  frameId?: number;
  tab?: {
    active: boolean;
    audible: boolean;
    autoDiscardable: boolean;
    favIconUrl: string;
    groupId: number;
    height: number;
    highlighted: boolean;
    id: number;
    incognito: boolean;
    index: number;
    mutedInfo: {
      muted: boolean;
    };
    pinned: boolean;
    selected: boolean;
    status: string;
    title: string;
    url: string;
    width: number;
    windowId: number;
  };
};
