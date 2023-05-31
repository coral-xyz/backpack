type Instruction = {
  accounts: Array<any>;
  data: string;
  programId: string;
  innerInstructions: Array<any>;
};

type TokenTransfer = {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
};

type AccountData = {
  accounts: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: Array<any>;
  innerInstructions: Array<any>;
};

export type HeliusParsedTransaction = {
  accountData: Array<AccountData>;
  blockchain: string;
  description: string;
  events: any;
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
};
