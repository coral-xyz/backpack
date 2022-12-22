import {
  TAB_APPS,
  TAB_BALANCES,
  TAB_MESSAGES,
  TAB_NFTS,
  TAB_SWAP,
} from "@coral-xyz/common";
import type { BigNumber } from "ethers";
import type { RecoilValueReadOnly } from "recoil";

import { makeUrl } from "./hooks";

export type NamedPublicKey = {
  publicKey: string;
  name: string;
};

export type WalletPublicKeys = {
  [key: string]: {
    hdPublicKeys: Array<NamedPublicKey>;
    importedPublicKeys: Array<NamedPublicKey>;
    ledgerPublicKeys: Array<NamedPublicKey>;
  };
};

export interface TokenNativeData {
  name: string;
  decimals: number;
  nativeBalance: BigNumber;
  displayBalance: string;
  ticker: string;
  logo: string;
  address: string;
  mint?: string;
}

export interface TokenData extends TokenNativeData {
  usdBalance: number;
  recentPercentChange: number | undefined;
  recentUsdBalanceChange: number;
  priceData: any;
}

export type TokenDisplay = {
  name: string;
  ticker: string;
  displayBalance: number;
  nativeBalance: number;
  usdBalance: string;
  recentUsdBalanceChange: string;
  logo: string;
  priceData: any;
};

export const TABS = [
  [TAB_BALANCES, "Balances"],
  [TAB_NFTS, "Nfts"],
  [TAB_SWAP, "Swap"],
  [TAB_APPS, "Apps"],
  [TAB_MESSAGES, "Messages"],
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
