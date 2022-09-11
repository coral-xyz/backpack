import { EventEmitter } from "eventemitter3";
import { ethErrors } from "eth-rpc-errors";
import { ethers } from "ethers";
import type { Event } from "@coral-xyz/common";
import {
  getLogger,
  BackgroundEthereumProvider,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_RPC_RESPONSE,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  ETHEREUM_RPC_METHOD_CONNECT,
  ETHEREUM_RPC_METHOD_DISCONNECT,
  NOTIFICATION_ETHEREUM_CONNECTED,
  NOTIFICATION_ETHEREUM_DISCONNECTED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
} from "@coral-xyz/common";
import * as cmn from "./common/ethereum";
import { RequestManager } from "./request-manager";

const logger = getLogger("provider-ethereum-injection");

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

interface ProviderConnectInfo {
  readonly chainId: string;
}

export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

const messages = {
  errors: {
    disconnected: () =>
      "Backpack: Disconnected from chain. Attempting to connect.",
    invalidRequestArgs: () =>
      `Backpack: Expected a single, non-array, object argument.`,
    invalidRequestMethod: () =>
      `Backpack: 'args.method' must be a non-empty string.`,
    invalidRequestParams: () =>
      `Backpack: 'args.params' must be an object or array if provided.`,
  },
};

export class ProviderEthereumInjection extends EventEmitter {
  //
  // Channel to send extension specific RPC requests to the extension.
  //
  private _requestManager: RequestManager;
  //
  // Channel to send Solana Connection API requests to the extension.
  //
  private _connectionRequestManager: RequestManager;

  public isBackpack: boolean;
  public isConnected: boolean;
  public publicKey?: string;
  public provider: ethers.providers.JsonRpcProvider | null;
  public chainId: string | null;

  constructor() {
    super();
    this._requestManager = new RequestManager(
      CHANNEL_ETHEREUM_RPC_REQUEST,
      CHANNEL_ETHEREUM_RPC_RESPONSE
    );
    this._connectionRequestManager = new RequestManager(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
    );
    this._initChannels();

    this.isBackpack = true;
    this.isConnected = false;
    this.provider = null;
    this.chainId = null;
  }

  // Setup channels with the content script.
  _initChannels() {
    window.addEventListener("message", this._handleNotification.bind(this));
  }

  _handleNotification(event: Event) {
    if (event.data.type !== CHANNEL_ETHEREUM_NOTIFICATION) return;
    logger.debug("notification", event);

    switch (event.data.detail.name) {
      case NOTIFICATION_ETHEREUM_CONNECTED:
        this._handleNotificationConnected(event);
        break;
      case NOTIFICATION_ETHEREUM_DISCONNECTED:
        this._handleNotificationDisconnected(event);
        break;
      case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        this._handleNotificationConnectionUrlUpdated(event);
        break;
      case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
        this._handleNotificationActiveWalletUpdated(event);
        break;
      default:
        throw new Error(`unexpected notification ${event.data.detail.name}`);
    }

    this.emit(_mapNotificationName(event.data.detail.name));
  }

  async _handleNotificationConnected(event) {
    // Nothing to be done here, init is handled in the eth_accounts handler below
  }

  async _handleNotificationDisconnected(event) {}

  async _handleNotificationConnectionUrlUpdated(event) {
    const { connectionUrl } = event.data.detail.data;
    this.provider = new BackgroundEthereumProvider(
      this._connectionRequestManager,
      connectionUrl
    );
  }

  async _handleNotificationActiveWalletUpdated(event) {
    const { publicKey } = event.data.detail.data;
    this.publicKey = publicKey;
  }

  async request(args: RequestArguments): Promise<JsonRpcResponse> {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args,
      });
    }

    const { method, params } = args;

    if (typeof method !== "string" || method.length === 0) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args,
      });
    }

    if (
      params !== undefined &&
      !Array.isArray(params) &&
      (typeof params !== "object" || params === null)
    ) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestParams(),
        data: args,
      });
    }

    const requestAccounts = async () => {
      // Send request to the RPC API.
      const result = await this._requestManager.request({
        method: ETHEREUM_RPC_METHOD_CONNECT,
        params: [],
      });
      this.publicKey = result.publicKey;
      this.provider = new ethers.providers.JsonRpcProvider(
        result.connectionUrl
      );
      this.isConnected = true;
      return [result.publicKey];
    };

    const signTransaction = async (transaction: any) => {
      if (!this.publicKey) {
        throw new Error("wallet not connected");
      }
      return await cmn.signTransaction(
        this.publicKey,
        this._requestManager,
        transaction
      );
    };

    const signAndSendTransaction = async (transaction: any) => {
      if (!this.publicKey) {
        throw new Error("wallet not connected");
      }
      return await cmn.sendTransaction(
        this.publicKey,
        this._requestManager,
        transaction
      );
    };

    const signMessage = async (message: string) => {
      if (!this.publicKey) {
        throw new Error("wallet not connected");
      }
      return await cmn.signMessage(
        this.publicKey,
        this._requestManager,
        message
      );
    };

    const functionMap = {
      eth_accounts: requestAccounts,
      eth_requestAccounts: requestAccounts,
      eth_chainId: () =>
        this.provider!.getNetwork().then((network) =>
          network.chainId.toString()
        ),
      eth_getBalance: (address: string) => this.provider!.getBalance(address),
      eth_getCode: (address: string) => this.provider!.getCode(address),
      eth_getStorageAt: (address: string, position: string) =>
        this.provider!.getStorageAt(address, position),
      eth_getTransactionCount: (address: string) =>
        this.provider!.getTransactionCount(address),
      eth_getBlockByNumber: (block: number) => this.provider!.getBlock(block),
      eth_call: (transaction: any) => this.provider!.call(transaction),
      eth_estimateGas: (transaction: any) =>
        this.provider!.estimateGas(transaction),
      eth_getTransactionByHash: (hash: string) =>
        this.provider!.getTransaction(hash),
      eth_getTransactionReceipt: (hash: string) =>
        this.provider!.getTransactionReceipt(hash),
      eth_sign: (_address, message) => signMessage(message),
      eth_signTypedData: (_address, message) => signMessage(message),
      eth_signTransaction: (transaction) => signTransaction(transaction),
      eth_sendTransaction: (transaction) => signAndSendTransaction(transaction),
      personal_sign: (_address, message) => signMessage(message),
    };

    const func = functionMap[method];
    if (func === undefined) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args,
      });
    }

    return new Promise<JsonRpcResponse>(async (resolve, reject) => {
      let rpcResult;
      try {
        rpcResult = await func(...(<[]>(params ? params : [])));
      } catch (error) {
        console.error("rpc response error", error);
        return reject(error);
      }
      return resolve(rpcResult);
    });
  }
}

/// Maps the notification name (internal) to the event name.
function _mapNotificationName(notificationName: string) {
  switch (notificationName) {
    case NOTIFICATION_ETHEREUM_CONNECTED:
      return "connect";
    case NOTIFICATION_ETHEREUM_DISCONNECTED:
      return "disconnect";
    case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
      return "chainChanged";
    case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
      return "activeWalletDidChange";
    default:
      throw new Error(`unexpected notification name ${notificationName}`);
  }
}
