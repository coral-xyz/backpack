import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { NamedPublicKey } from "../background/backend";

export interface TokenAccount {
  amount: BN;
  closeAuthority: PublicKey | null;
  delegate: PublicKey;
  delegatedAmount: number | null;
  isNative: number | null;
  mint: PublicKey;
  authority: PublicKey;
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
