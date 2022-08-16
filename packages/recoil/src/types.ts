import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { TAB_BALANCES, TAB_SWAP, TAB_NFTS, TAB_APPS } from "@coral-xyz/common";
import { makeUrl } from "./hooks";

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
