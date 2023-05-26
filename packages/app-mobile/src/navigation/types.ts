import type { Blockchain, Nft } from "@coral-xyz/common";
import type { Token } from "~types/types";

export type UnlockedNavigatorStackParamList = {
  "edit-wallets-wallet-detail": { name: string; publicKey: string };
  Tabs: undefined;
  AccountSettings: undefined;
  RecentActivity: undefined;
  DepositList: undefined;
  DepositSingle: undefined;
  SendSelectTokenModal: undefined;
  "wallet-picker": undefined;
  SendTokenModal: {
    title: string;
    blockchain: Blockchain;
    token: Token;
  };
  SwapModal: undefined;
  SendTokenConfirm: {
    blockchain: Blockchain;
    token: Token;
    to: {
      walletName?: string | undefined; // TBD
      address: string;
      username: string;
      image: string;
      uuid: string;
    };
  };
  SendCollectibleSelectRecipient: {
    nft: Nft;
    to: {
      walletName?: string | undefined; // TBD
      address: string;
      username: string;
      image: string;
      uuid: string;
    };
  };
  // SendNFTConfirm: {
  //   nft: Nft;
  //   to: {
  //     walletName?: string | undefined; // TBD
  //     address: string;
  //     username: string;
  //     image: string;
  //     uuid: string;
  //   };
  // };
};

export type UnlockedTabNavigatorParamList = {
  Wallets: undefined;
  Chat: undefined;
  AccountSettings: undefined;
  Notifications: undefined;
  Utils: undefined;
};
