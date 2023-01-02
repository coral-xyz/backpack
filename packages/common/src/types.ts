import type { DerivationPath } from "./crypto";

export type Context<Backend> = {
  sender: any;
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
  name: string;
  symbol: string;
  tokenType: string;
  totalSupply: string;
  items: Nft[];
  metadataCollectionId?: string;
};

export type NftCollectionWithIds = {
  id: string;
  name: string;
  symbol: string;
  tokenType: string;
  totalSupply: string;
  items: Nft[];
  itemIds: string[];
  metadataCollectionId?: string;
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

export type KeyringType = "mnemonic" | "ledger";

export type KeyringInit = {
  // No mnemonic means this is a hardware wallet keyring
  mnemonic?: string;
  blockchainKeyrings: Array<BlockchainKeyringInit>;
};

export type BlockchainKeyringInit = {
  blockchain: Blockchain;
  derivationPath: DerivationPath;
  accountIndex: number;
  publicKey: string;
  signature: string;
};

export interface XnftPreference {
  disabled: boolean;
  mediaPermissions: boolean;
  pushNotifications: boolean;
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
  accountIndices: Array<number>;
  derivationPath: DerivationPath;
};

export type LedgerKeyringJson = {
  derivationPaths: Array<ImportedDerivationPath>;
};

export type ImportedDerivationPath = {
  path: string;
  account: number;
  publicKey: string;
};

export type SolanaFeeConfig = { computeUnits: number; priorityFee: bigint };
export type FeeConfig = SolanaFeeConfig;
