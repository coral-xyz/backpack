import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import {
  TAB_BALANCES,
  TAB_QUEST,
  TAB_BRIDGE,
  TAB_FRIENDS,
} from "@200ms/common";

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
  [TAB_BRIDGE, "Bridge"],
  [TAB_QUEST, "Quest"],
  [TAB_FRIENDS, "Friends"],
];

export function makeDefaultNav() {
  const defaultNav: any = {
    activeTab: TAB_BALANCES,
    data: {},
  };
  TABS.forEach(([tabName, tabTitle]) => {
    defaultNav.data[tabName] = {
      id: tabName,
      title: tabTitle,
      components: [],
      props: [],
      titles: [],
      transition: "init",
    };
  });
  return defaultNav;
}
