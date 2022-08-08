import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";

export type TokenAccountInfo = {
  mint: PublicKey;
  pubkey: PublicKey;
  tokenAccount: AccountInfo<ParsedAccountData | Buffer>;
};
