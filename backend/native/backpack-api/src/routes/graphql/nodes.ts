import type {
  Balances,
  ChainId,
  Collection,
  Friend,
  FriendRequest,
  Listing,
  MarketData,
  Nft,
  Node,
  Notification,
  NotificationApplicationData,
  TokenBalance,
  TokenListEntry,
  Transaction,
  User,
  Wallet,
} from "./types";

export abstract class NodeBuilder {
  static balances(
    owner: string,
    chainId: ChainId,
    data: Omit<Balances, "id">
  ): Balances {
    return this._createNode(`${chainId}_balances:${owner}`, data);
  }

  static friend(dbId: unknown, data: Omit<Friend, "id">): Friend {
    return this._createNode(`friend:${dbId}`, data);
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
    chainId: ChainId,
    data: Omit<Nft, "id">,
    uniqueIdOverride?: string
  ): Nft {
    return this._createNode(
      `${chainId}_nft:${uniqueIdOverride ?? data.address}`,
      data
    );
  }

  static nftCollection(
    chainId: ChainId,
    data: Omit<Collection, "id">
  ): Collection {
    return this._createNode(`${chainId}_nft_collection:${data.address}`, data);
  }

  static notification(
    dbId: unknown,
    data: Omit<Notification, "id">
  ): Notification {
    return this._createNode(`notification:${dbId}`, data);
  }

  static notificationAppData(
    address: string,
    data: Omit<NotificationApplicationData, "id">
  ): NotificationApplicationData {
    return this._createNode(`notification_app:${address}`, data);
  }

  static tensorListing(mint: string, data: Omit<Listing, "id">): Listing {
    return this._createNode(`tensor_active_listing:${mint}`, data);
  }

  static tokenBalance(
    chainId: ChainId,
    data: Omit<TokenBalance, "id">,
    native: boolean,
    uniqueIdOverride?: string
  ): TokenBalance {
    return this._createNode(
      `${chainId}_${native ? "native" : "token"}_address:${
        uniqueIdOverride ?? data.address
      }`,
      data
    );
  }

  static tokenListEntry(data: Omit<TokenListEntry, "id">): TokenListEntry {
    return this._createNode(`token_list_entry:${data.address}`, data);
  }

  static transaction(
    chainId: ChainId,
    data: Omit<Transaction, "id">,
    uniqueIdOverride?: string
  ): Transaction {
    return this._createNode(
      `${chainId}_transaction:${uniqueIdOverride ?? data.hash}`,
      data
    );
  }

  static user(data: Omit<User, "id">): User {
    return this._createNode(`user:${data.userId}`, data);
  }

  static wallet(chainId: ChainId, data: Omit<Wallet, "id">): Wallet {
    return this._createNode(`${chainId}_wallet:${data.address}`, data);
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
