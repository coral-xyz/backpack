export const enum heliusTransactionTypes {
  transfer = "TRANSFER",
  swap = "SWAP",
  nftListing = "NFT_LISTING",
  nftSale = "NFT_SALE",
  nftCancelListing = "NFT_CANCEL_LISTING",
  unknown = "UNKNOWN",
  burn = "BURN",
  mint = "MINT",
  tokenMint = "TOKEN_MINT",
  nftMint = "NFT_MINT",
}

export const enum heliusSourceTypes {
  cardinalRent = "CARDINAL_RENT",
  unknown = "UNKNOWN",
}

export type Instruction = {
  accounts: Array<any>;
  data: string;
  programId: string;
  innerInstructions: Array<any>;
};

export type TokenTransfer = {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
};

export type AccountData = {
  accounts: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: Array<any>;
  innerInstructions: Array<any>;
};

export type HeliusParsedTransaction = {
  accountData: Array<AccountData>;
  blockchain: string;
  description: string;
  events: Object;
  fee: number;
  feePayer: string;
  instructions: Array<Instruction>;
  nativeTransfers: Array<any>;
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: Array<TokenTransfer>;
  transactionError: string | null;
  type: string;
  metadata?: any;
};

// ALL types including 'NFT' are handled by isNFTTransaction
// - NFT_BID
// - NFT_BID_CANCELLED
// - NFT_LISTING
// - NFT_CANCEL_LISTING
// - NFT_SALE
// - NFT_MINT
// - NFT_AUCTION_CREATED
// - NFT_AUCTION_UPDATED
// - NFT_AUCTION_CANCELLED
// - NFT_PARTICIPATION_REWARD
// - NFT_MINT_REJECTED
// - BURN_NFT
// - NFT_RENT_UPDATE_LISTING
// - NFT_RENT_ACTIVATE
// - NFT_RENT_CANCEL_LISTING
// - NFT_RENT_LISTING
// - NFT_GLOBAL_BID
// - NFT_GLOBAL_BID_CANCELLED

// Types without a mapped Source  (https://docs.helius.xyz/api-reference/transaction-types#type-to-source)
// - INIT_SWAP
// - CANCEL_SWAP
// - REJECT_SWAP
// - INITIALIZE_ACCOUNT
// - ATTACH_METADATA
// - PLACE_BET
// - PLACE_SOL_BET
// - ACCEPT_REQUEST_ARTIST
// - CANCEL_ESCROW
// - ACCEPT_ESCROW_ARTIST
// - ACCEPT_ESCROW_USER
// - UPGRADE_FOX_REQUEST
// - LOAN_FOX
// - BORROW_FOX
// - SWITCH_FOX_REQUEST
// - SWITCH_FOX
// - CREATE_ESCROW
// - CLOSE_ITEM
// - BUY_ITEM
// - FILL_ORDER
// - UPDATE_ORDER
// - CREATE_ORDER
// - CLOSE_ORDER
// - CANCEL_ORDER
// - KICK_ITEM
// - BUY_TICKETS
// - UPDATE_ITEM
// - LIST_ITEM
// - DELIST_ITEM
// - ADD_ITEM
// - CREATE_APPARAISAL
// - PLATFORM_FEE
// - LOAN
// - REPAY_LOAN
// - ADD_TO_POOL
// - REMOVE_FROM_POOL
// - CLOSE_POSITION
// - UNLABELED
// - CLOSE_ACCOUNT
