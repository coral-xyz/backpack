import { PublicKey } from "@solana/web3.js";

export interface TokenAccount {
  amount: number;
  closeAuthority: PublicKey;
  closeAuthorityOption: number;
  delegate: PublicKey;
  delegateOption: number;
  delegatedAmount: number;
  isNative: number;
  isNativeOption: number;
  mint: PublicKey;
  owner: PublicKey;
  state: number;
}

export interface TokenAccountWithKey extends TokenAccount {
  key: PublicKey;
}
