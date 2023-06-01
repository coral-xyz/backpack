import type { SubscriptionType, Blockchain, Nft } from "@coral-xyz/common";
import type { Token } from "~types/types";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackScreenProps } from "@react-navigation/stack";

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
  TokenPrices: undefined;
  Chat: undefined;
  AccountSettings: undefined;
  Notifications: undefined;
  Utils: undefined;
  Browser: undefined;
};

export type TokenPriceStackParamList = {
  TokenPriceList: undefined;
  TokenPriceDetail: { title: string; tokenId: string };
  TokenPriceBuy: { tokenId: string };
  TokenPriceSwap: { tokenId: string };
};

export type TokenPriceListScreenParams = NativeStackScreenProps<
  TokenPriceStackParamList,
  "TokenPriceList"
>;

export type TokenPriceDetailScreenParams = NativeStackScreenProps<
  TokenPriceStackParamList,
  "TokenPriceDetail"
>;

export type TokenPriceBuyScreenParams = NativeStackScreenProps<
  TokenPriceStackParamList,
  "TokenPriceBuy"
>;

export type TokenPriceSwapScreenParams = NativeStackScreenProps<
  TokenPriceStackParamList,
  "TokenPriceSwap"
>;

export type ChatStackNavigatorParamList = {
  ChatList: undefined;
  ChatDetail: {
    roomName: string;
    roomId: string;
    roomType: SubscriptionType;
    remoteUserId?: string;
    remoteUsername?: string;
  };
  ChatRequest: undefined;
  ChatRequestDetail: {
    roomName: string;
  };
};

export type ChatListScreenProps = NativeStackScreenProps<
  ChatStackNavigatorParamList,
  "ChatList"
>;

export type ChatDetailScreenProps = NativeStackScreenProps<
  ChatStackNavigatorParamList,
  "ChatDetail"
>;
