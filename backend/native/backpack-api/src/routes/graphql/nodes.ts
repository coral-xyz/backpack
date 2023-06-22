import type {
  Balances,
  Collection,
  Friend,
  FriendPrimaryWallet,
  FriendRequest,
  Listing,
  MarketData,
  Nft,
  Node,
  Notification,
  NotificationApplicationData,
  Provider,
  ProviderId,
  TokenBalance,
  TokenListEntry,
  Transaction,
  User,
  Wallet,
} from "./types";

export abstract class NodeBuilder {
  static balances(
    owner: string,
    providerId: ProviderId | "AGGREGATE",
    data: Omit<Balances, "id">
  ): Balances {
    return this._createNode(`${providerId}_balances:${owner}`, data);
  }

  static friend(dbId: unknown, data: Omit<Friend, "id">): Friend {
    return this._createNode(`friend:${dbId}`, data);
  }

  static friendPrimaryWallet(
    userId: string,
    data: Omit<FriendPrimaryWallet, "id">
  ): FriendPrimaryWallet {
    return this._createNode(
      `friend_primary_wallet:${userId}:${data.address}`,
      data
    );
  }

  static friendRequest(
    dbId: unknown,
    data: Omit<FriendRequest, "id">
  ): FriendRequest {
    return this._createNode(`friend_request:${dbId}`, data);
  }

  static marketData(id: string, data: Omit<MarketData, "id">): MarketData {
    return this._createNode(`coingecko_market_data:${id}`, data);
  }

  static nft(
    providerId: ProviderId,
    data: Omit<Nft, "id">,
    uniqueIdOverride?: string
  ): Nft {
    return this._createNode(
      `${providerId}_nft:${uniqueIdOverride ?? data.address}`,
      data
    );
  }

  static nftCollection(
    providerId: ProviderId,
    data: Omit<Collection, "id">
  ): Collection {
    return this._createNode(
      `${providerId}_nft_collection:${data.address}`,
      data
    );
  }

  static notification(data: Omit<Notification, "id">): Notification {
    return this._createNode(`notification:${data.dbId}`, data);
  }

  static notificationAppData(
    address: string,
    data: Omit<NotificationApplicationData, "id">
  ): NotificationApplicationData {
    return this._createNode(`notification_app:${address}`, data);
  }

  static provider(data: Omit<Provider, "id">): Provider {
    return this._createNode(`provider:${data.providerId}`, data);
  }

  static tensorListing(mint: string, data: Omit<Listing, "id">): Listing {
    return this._createNode(`tensor_active_listing:${mint}`, data);
  }

  static tokenBalance(
    providerId: ProviderId,
    data: Omit<TokenBalance, "id">,
    native: boolean,
    uniqueIdOverride?: string
  ): TokenBalance {
    return this._createNode(
      `${providerId}_${native ? "native" : "token"}_address:${
        uniqueIdOverride ?? data.address
      }`,
      data
    );
  }

  static tokenListEntry(data: Omit<TokenListEntry, "id">): TokenListEntry {
    return this._createNode(`token_list_entry:${data.address}`, data);
  }

  static transaction(
    providerId: ProviderId,
    data: Omit<Transaction, "id">,
    uniqueIdOverride?: string
  ): Transaction {
    return this._createNode(
      `${providerId}_transaction:${uniqueIdOverride ?? data.hash}`,
      data
    );
  }

  static user(data: Omit<User, "id">): User {
    return this._createNode(`user:${data.userId}`, data);
  }

  static wallet(ProviderId: ProviderId, data: Omit<Wallet, "id">): Wallet {
    return this._createNode(`${ProviderId}_wallet:${data.address}`, data);
  }

  private static _createNode<T extends Node>(
    id: string,
    obj: Omit<T, "id">
  ): T {
    return {
      id,
      ...obj,
    } as T;
  }
}
