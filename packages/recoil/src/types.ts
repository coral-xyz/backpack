import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { TAB_BALANCES, TAB_SWAP, TAB_NFTS, TAB_APPS } from "@200ms/common";
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

export type WalletPublicKeys = {
  hdPublicKeys: Array<NamedPublicKey>;
  importedPublicKeys: Array<NamedPublicKey>;
  ledgerPublicKeys: Array<NamedPublicKey>;
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

export type NamedPublicKey = {
  publicKey: string;
  name: string;
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
