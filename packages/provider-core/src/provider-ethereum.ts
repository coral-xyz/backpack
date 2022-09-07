import { EventEmitter } from "eventemitter3";
import { ethErrors } from "eth-rpc-errors";
import { ethers } from "ethers";
import type { Event } from "@coral-xyz/common";
import {
  getLogger,
  BackgroundEthereumProvider,
  ETHEREUM_RPC_METHOD_CONNECT,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_RPC_RESPONSE,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
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
  public chainId: string | null;
  public address?: string;
  public selectedAddress?: string;
  public publicKey?: string;
  public provider?: ethers.providers.JsonRpcProvider;

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
    const { publicKey, connectionUrl } = event.data.detail.data;
    this.publicKey = publicKey;
    this.provider = new ethers.providers.JsonRpcProvider(connectionUrl);
    this.isConnected = true;
  }

  async _handleNotificationDisconnected(event) {}

  async _handleNotificationConnectionUrlUpdated(event) {}

  async _handleNotificationActiveWalletUpdated(event) {}

  /**
   * Submits an RPC request for the given method, with the given params.
   * Resolves with the result of the method call, or rejects on error.
   *
   * @param args - The RPC request arguments.
   * @param args.method - The RPC method name.
   * @param args.params - The parameters for the RPC method.
   * @returns A Promise that resolves with the result of the RPC method,
   * or rejects if an error is encountered.
   */
  async request(args: RequestArguments): Promise<JsonRpcResponse> {
    console.log(args);
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      console.log(args);
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
      return [result.publicKey];
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
      eth_sign: (_address, msg) =>
        cmn.signMessage(this.publicKey!, this._requestManager, msg),
      eth_signTypedData: (_address, msg) =>
        cmn.signMessage(this.publicKey!, this._requestManager, msg),
      eth_signTransaction: (transaction) =>
        cmn.signTransaction(
          this.publicKey!,
          this._requestManager,
          this.provider!,
          transaction
        ),
      eth_sendTransaction: (transaction) =>
        cmn.sendTransaction(
          this.publicKey!,
          this._requestManager,
          this.provider!,
          transaction
        ),
    };

    const func = functionMap[method];
    if (func === undefined) {
      console.log("no function for rpc method", method);
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args,
      });
    }

    return new Promise<JsonRpcResponse>(async (resolve, reject) => {
      let rpcResult;
      try {
        rpcResult = await func(...(<[]>(params ? params : [])));
        console.log("rpc result", rpcResult);
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
