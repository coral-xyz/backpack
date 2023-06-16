import type { Event } from "@coral-xyz/common";
import {
  BackgroundEthereumProvider,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_RPC_RESPONSE,
  ETHEREUM_RPC_METHOD_CONNECT,
  ETHEREUM_RPC_METHOD_SWITCH_CHAIN,
  getLogger,
  InjectedRequestManager,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_DISCONNECTED,
} from "@coral-xyz/common";
import { ethErrors } from "eth-rpc-errors";
import { ethers } from "ethers";
import EventEmitter from "eventemitter3";

import * as cmn from "./common/ethereum";
import { isValidEventOrigin } from ".";

const logger = getLogger("provider-ethereum-injection");

export type EthersSendCallback = (error: unknown, response: unknown) => void;

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#request
interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#rpc-errors
interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect-1
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

const originRequiresMetaMask = [
  "opensea.io",
  "matcha.xyz",
  "kwenta.io",
  "etherscan.io",
  "uniswap.org",
];

export interface BaseProviderState {
  accounts: null | string[];
  isConnected: boolean;
}

export class ProviderEthereumInjection extends EventEmitter {
  state: BaseProviderState;

  protected static _defaultState: BaseProviderState = {
    accounts: null,
    isConnected: false,
  };

  /**
   * Channel to send extension specific RPC requests to the extension.
   */
  requestManager: InjectedRequestManager;

  /**
   *  Channel to send Solana connection API requests to the extension.
   */
  connectionRequestManager: InjectedRequestManager;

  /**
   * The chain ID of the currently connected Ethereum chain.
   */
  chainId: string;

  /**
   * The user's currently selected Ethereum address.
   */
  publicKey: string | null;

  /**
   *
   */
  public networkVersion?: string;

  /**
   * Boolean indicating that the provider is Backpack.
   */
  isBackpack: boolean;

  /**
   * Boolean for impersonating MetaMask.
   */
  isMetaMask: boolean;

  /**
   * Ethereum JSON RPC provider.
   */
  provider?: ethers.providers.JsonRpcProvider;

  /**
   * Deprecated.
   */
  autoRefreshOnNetworkChange: Boolean;

  constructor() {
    super();

    this.requestManager = new InjectedRequestManager(
      CHANNEL_ETHEREUM_RPC_REQUEST,
      CHANNEL_ETHEREUM_RPC_RESPONSE
    );

    this.connectionRequestManager = new InjectedRequestManager(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
    );

    this.initChannels();

    this.setState({
      ...ProviderEthereumInjection._defaultState,
    });

    this.isBackpack = true;
    this.chainId = "0x1";
    this.publicKey = null;
    this.autoRefreshOnNetworkChange = false;

    // Sometimes we want to pretend to be MetaMask
    this.isMetaMask = originRequiresMetaMask.some((h) =>
      window.location.host.includes(h)
    );
  }

  // Setup channels with the content script.
  initChannels = () => {
    window.addEventListener("message", this._handleNotification.bind(this));
  };

  setState = (updatedState) => {
    this.state = updatedState;
    Object.freeze(this.state);
  };

  //
  // Public methods
  //

  /**
   * Returns whether the provider can process RPC requests.
   */
  isConnected = (): boolean => {
    return this.state.isConnected;
  };

  // Deprecated EIP-1193 method
  enable = async (): Promise<unknown> => {
    return this.request({ method: "eth_requestAccounts" });
  };

  // Deprecated EIP-1193 method
  send = (
    methodOrRequest: string | RequestArguments,
    paramsOrCallback: Array<unknown> | EthersSendCallback
  ): Promise<unknown> | void => {
    if (
      typeof methodOrRequest === "string" &&
      typeof paramsOrCallback !== "function"
    ) {
      return this.request({
        method: methodOrRequest,
        params: paramsOrCallback,
      });
    } else if (
      typeof methodOrRequest === "object" &&
      typeof paramsOrCallback === "function"
    ) {
      return this.sendAsync(methodOrRequest, paramsOrCallback);
    }
    return Promise.reject(new Error("Unsupported function parameters"));
  };

  // Deprecated EIP-1193 method still in use by some DApps
  sendAsync = (
    request: RequestArguments & { id?: number; jsonrpc?: string },
    callback: (error: unknown, response: unknown) => void
  ): Promise<unknown> | void => {
    return this.request(request).then(
      (response) =>
        callback(null, {
          result: response,
          id: request.id,
          jsonrpc: request.jsonrpc,
        }),
      (error) => callback(error, null)
    );
  };

  /**
   *
   */
  request = async (args: RequestArguments): Promise<JsonRpcResponse> => {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args,
      });
    }

    const { method, params } = args;

    logger.debug("page injected provider request", method, args);

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

    const rpc_fallback = (method: string) => async (params: any[]) => {
      const result = await this.provider!.send(method, params);
      return result;
    };

    const functionMap = {
      eth_accounts: this.handleEthAccounts,
      eth_requestAccounts: this.handleEthRequestAccounts,
      eth_chainId: () => this.chainId,
      net_version: () => `${parseInt(this.chainId)}`,
      eth_getBalance: async (...params) =>
        rpc_fallback("eth_getBalance")(params),
      eth_getGasPrice: async (...params) =>
        rpc_fallback("eth_getGasPrice")(params),
      eth_getCode: (address: string) => this.provider!.getCode(address),
      eth_getStorageAt: (address: string, position: string) =>
        this.provider!.getStorageAt(address, position),
      eth_getTransactionCount: (address: string) =>
        this.provider!.getTransactionCount(address),
      eth_blockNumber: () => this.provider!.getBlockNumber(),
      eth_getBlockByNumber: (block: number) => this.provider!.getBlock(block),
      eth_call: (transaction: any) => this.provider!.call(transaction),
      eth_estimateGas: (transaction: any) =>
        this.provider!.estimateGas(transaction),
      eth_getTransactionByHash: (hash: string) =>
        this.provider!.getTransaction(hash),
      eth_getTransactionReceipt: (hash: string) =>
        this.provider!.getTransactionReceipt(hash),
      eth_sign: (_address: string, _message: string) => {
        // This is a significant security risk because it can be used to
        // sign transactions.
        // TODO maybe enable this with a large warning in the UI?
        throw new Error(
          "Backpack does not support eth_sign due to security concerns"
        );
      },
      personal_sign: (messageHex: string, _address: string) =>
        this.handleEthSignMessage(messageHex),
      eth_signTypedData_v4: (_address: string, messageHex: string) => {
        throw new Error("Backpack does not support eth_signTypedData_v4");
      },
      eth_signTransaction: (transaction: any) =>
        this.handleEthSignTransaction(transaction),
      eth_sendTransaction: (transaction: any) =>
        this.handleEthSendTransaction(transaction),
      wallet_switchEthereumChain: ({ chainId }) =>
        this.handleEthSwitchChain(chainId),
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
  };

  //
  // Private methods
  //

  /**
   *  Handle notifications from Backpack.
   */
  _handleNotification = (event: Event) => {
    if (!isValidEventOrigin(event)) return;
    if (event.data.type !== CHANNEL_ETHEREUM_NOTIFICATION) return;
    logger.debug("notification", event);

    switch (event.data.detail.name) {
      case NOTIFICATION_ETHEREUM_CONNECTED:
        this._handleNotificationConnected(event);
        break;
      case NOTIFICATION_ETHEREUM_DISCONNECTED:
        this._handleNotificationDisconnected();
        break;
      case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        this._handleNotificationConnectionUrlUpdated(event);
        break;
      case NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED:
        this._handleNotificationChainIdUpdated(event);
        break;
      case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
        this._handleNotificationActiveWalletUpdated(event);
        break;
      default:
        throw new Error(`unexpected notification ${event.data.detail.name}`);
    }
  };

  /**
   * Handle a connect notification from Backpack.
   */
  _handleNotificationConnected = async (event) => {
    const { publicKey, connectionUrl, chainId } = event.data.detail.data;
    this.publicKey = publicKey;
    this.provider = new ethers.providers.JsonRpcProvider(
      connectionUrl,
      parseInt(chainId)
    );
    this.handleConnect(chainId);
    this.handleChainChanged(chainId);
    this.handleAccountsChanged([this.publicKey]);
  };

  /**
   * Handle a disconnection notification from Backpack.
   */
  _handleNotificationDisconnected = async () => {
    if (this.isConnected()) {
      // Reset public state
      this.publicKey = null;
      // Reset private state
      this.setState({
        ...ProviderEthereumInjection._defaultState,
      });
    }
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#disconnect
    this.emit("disconnect", {
      code: 4900,
      message: "User disconnected",
    } as ProviderRpcError);
  };

  /**
   * Handle a change of the RPC connection URL in Backpack. This may also be a change
   * of the chainId/network if the change was to a different network RPC.
   */
  _handleNotificationConnectionUrlUpdated = async (event: any) => {
    const { connectionUrl } = event.data.detail.data;
    this.provider = new BackgroundEthereumProvider(
      this.connectionRequestManager,
      connectionUrl
    );
  };

  _handleNotificationChainIdUpdated = async (event: any) => {
    const { chainId } = event.data.detail.data;
    this.handleChainChanged(chainId);
  };

  /**
   * Handle a change of the active wallet in Backpack.
   */
  _handleNotificationActiveWalletUpdated = async (event: any) => {
    const { activeWallet } = event.data.detail.data;
    if (this.publicKey !== activeWallet) {
      this.publicKey = activeWallet;
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#accountschanged
      this.handleAccountsChanged([this.publicKey]);
    }
  };

  /**
   * Update local state and emit required event for connect.
   */
  handleConnect = async (chainId: string) => {
    if (!this.state.isConnected) {
      this.setState({ ...this.state, isConnected: true });
    }
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect
    this.emit("connect", { chainId } as ProviderConnectInfo);
  };

  /**
   * Update local state and emit required event for chain change.
   */
  handleChainChanged = (chainId: string) => {
    this.chainId = chainId;
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#chainchanged
    this.emit("chainChanged", chainId);
  };

  /**
   * Emit the required event for a change of accounts.
   */
  handleAccountsChanged = async (accounts: unknown[]) => {
    this.emit("accountsChanged", accounts);
  };

  /**
   * Handle eth_accounts requests
   */
  handleEthAccounts = async () => {
    if (this.isConnected() && this.publicKey) {
      return [this.publicKey];
    }
    return [];
  };

  /**
   * Handle wallet_switchEthereumChain requests
   */
  handleEthSwitchChain = async (chainId) => {
    // Send request to the RPC API.
    const response = await this.requestManager.request({
      method: ETHEREUM_RPC_METHOD_SWITCH_CHAIN,
      params: [chainId],
    });

    return response;
  };

  /**
   * Handle wallet_switch requests
   */
  handleEthRequestAccounts = async () => {
    // Send request to the RPC API.
    if (this.isConnected() && this.publicKey) {
      return [this.publicKey];
    } else {
      const result = await this.requestManager.request({
        method: ETHEREUM_RPC_METHOD_CONNECT,
        params: [],
      });
      return result.publicKey ? [result.publicKey] : [];
    }
  };

  /**
   * Handle eth_sign, eth_signTypedData, personal_sign RPC requests.
   */
  handleEthSignMessage = async (messageHex: string) => {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(
      this.publicKey,
      this.requestManager,
      ethers.utils.toUtf8String(messageHex)
    );
  };

  /**
   * Handle eth_signTransaction RPC requests.
   */
  handleEthSignTransaction = async (transaction: any) => {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      this.publicKey,
      this.requestManager,
      transaction
    );
  };

  /**
   * Handle eth_sendTransaction RPC requests.
   */
  handleEthSendTransaction = async (transaction: any) => {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendTransaction(
      this.publicKey,
      this.requestManager,
      transaction
    );
  };
}
