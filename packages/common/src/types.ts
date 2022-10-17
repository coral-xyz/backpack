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
};

export type Nft = {
  id: string;
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

export interface Metadata {
  isDarkMode: boolean;
}
