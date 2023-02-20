import {
  TAB_APPS,
  TAB_BALANCES,
  TAB_MESSAGES,
  TAB_NFTS,
  TAB_NOTIFICATIONS,
  TAB_RECENT_ACTIVITY,
  TAB_SWAP,
} from "@coral-xyz/common";
import type { BigNumber } from "ethers";
import type { RecoilValueReadOnly } from "recoil";

import { makeUrl } from "./hooks";

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
}

export const TABS = [
  [TAB_BALANCES, "Balances"],
  [TAB_NFTS, "Nfts"],
  [TAB_SWAP, "Swap"],
  [TAB_APPS, "Apps"],
  [TAB_MESSAGES, "Messages"],
  [TAB_RECENT_ACTIVITY, "Recent Activity"],
  [TAB_NOTIFICATIONS, "Notifications"],
];

export function makeDefaultNav() {
  const defaultNav: any = {
    activeTab: TAB_BALANCES,
    data: {},
  };
  TABS.forEach(([tabName, tabTitle]) => {
    defaultNav.data[tabName] = {
      id: tabName,
      urls: [makeUrl(tabName, { title: tabTitle, props: {} })],
    };
  });
  return defaultNav;
}

export type ExtractRecoilType<P> = P extends RecoilValueReadOnly<infer T>
  ? T
  : never;
