import { type Blockchain } from "@coral-xyz/common";
import type { PublicKeyType } from "@coral-xyz/secure-background/types";
import type { BigNumber } from "ethers";
import type { RecoilValueReadOnly } from "recoil";

export type Wallet = {
  name: string;
  type: PublicKeyType;
  publicKey: string;
  blockchain: Blockchain;
  isCold: boolean;
};

//
// Client side public keys
//

export type NamedPublicKey = {
  name: string;
  publicKey: string;
};

export type PublicKeyMetadata = NamedPublicKey & {
  isCold: boolean;
};

export type WalletPublicKeys = {
  [key: string]: {
    hdPublicKeys: Array<PublicKeyMetadata>;
    importedPublicKeys: Array<PublicKeyMetadata>;
    ledgerPublicKeys: Array<PublicKeyMetadata>;
  };
};

//
// Tokens
//

export interface TokenData {
  name: string;
  decimals: number;
  ticker: string;
  logo: string;
  address: string;
  // Mint is Solana only so is optional
  mint?: string;
}

export interface TokenDataWithBalance extends TokenData {
  nativeBalance: BigNumber;
  displayBalance: string;
}

export interface TokenDataWithPrice extends TokenDataWithBalance {
  usdBalance: number;
  recentPercentChange: number | undefined;
  recentUsdBalanceChange: number;
  priceData: any;
}

export type TokenDisplay = Pick<
  TokenDataWithPrice,
  | "name"
  | "ticker"
  | "logo"
  | "displayBalance"
  | "nativeBalance"
  | "usdBalance"
  | "recentUsdBalanceChange"
  | "priceData"
>;

export interface TokenMetadata {
  name: string;
  image: string;
  symbol: string;
  decimals: number;
  properties?: unknown;
}

export type ExtractRecoilType<P> = P extends RecoilValueReadOnly<infer T>
  ? T
  : never;
