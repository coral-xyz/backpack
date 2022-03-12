import { PublicKey } from "@solana/web3.js";
import { NamedPublicKey } from "../background/backend";

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

export type WalletPublicKeys = {
  hdPublicKeys: Array<NamedPublicKey>;
  importedPublicKeys: Array<NamedPublicKey>;
  // TODO: ledger.
};

export type TokenDisplay = {
  name: string;
  nativeBalance: number;
  ticker: string;
  usdBalance: string;
  recentUsdBalanceChange: string;
  logo: string;
  priceData: any;
};
