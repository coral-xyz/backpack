import type { Event } from "@coral-xyz/common";
import {
  Blockchain,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_RPC_RESPONSE,
  ETHEREUM_RPC_METHOD_SWITCH_CHAIN,
  getLogger,
  InjectedRequestManager,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
} from "@coral-xyz/common";
import { EthereumClient } from "@coral-xyz/secure-clients";
import type {
  SECURE_EVM_EVENTS,
  TransportSender,
} from "@coral-xyz/secure-clients/types";
import type { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";
import { ethErrors } from "eth-rpc-errors";
import type {
  JsonRpcApiProvider,
  TransactionLike,
  TransactionRequest,
} from "ethers6";
import EventEmitter from "eventemitter3";

import { isValidEventOrigin } from ".";

const logger = getLogger("provider-ethereum-injection");

export type EthersSendCallback = (error: unknown, response: unknown) => void;

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#request
interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#rpc-errors
// interface ProviderRpcError extends Error {
//   code: number;
//   data?: unknown;
// }

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect-1
interface ProviderConnectInfo {
  readonly chainId: string;
}

export interface EIP1193Provider {
  on: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  removeListener: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  request(args: RequestArguments): Promise<unknown>;
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

export class ProviderEthereumInjection
  extends EventEmitter
  implements EIP1193Provider
{
  /**
   * Channel to send extension specific RPC requests to the extension.
   */
  #requestManager: InjectedRequestManager;

  /**
   *  Channel to send Solana connection API requests to the extension.
   */
  #connectionRequestManager: InjectedRequestManager;

  #secureEthereumClient: EthereumClient;
  #secureClientSender: TransportSender<SECURE_EVM_EVENTS>;
  /**
   * The chain ID of the currently connected Ethereum chain.
   */
  #chainId: string | null = null;

  #isConnected = false;

  /**
   * The user's currently selected Ethereum address.
   */
  #accounts: string[] = [];

  /**
   * Boolean indicating that the provider is Backpack.
   * And Flag if backpack was recognized so we dont have to impersonate Metamask.
   */
  backpackRecognized: boolean = false;

  public get isBackpack(): true {
    try {
      this.backpackRecognized = true;
    } catch {
      null;
    }
    return true;
  }
  /**
   * Boolean for impersonating MetaMask.
   */
  #metaMaskRecognized: boolean = false;
  #shouldBeMetaMask: boolean = true;
  public get isMetaMask(): boolean {
    this.#metaMaskRecognized = true;
    return this.#shouldBeMetaMask && !this.backpackRecognized;
  }

  /**
   * Ethereum JSON RPC provider.
   */
  #provider: JsonRpcApiProvider;

  /**
   * Deprecated.
   */
  // #autoRefreshOnNetworkChange: Boolean;

  // get chainId() {
  //   return this.#chainId
  // }

  // get publicKey() {
  //   return this.#publicKey
  // }

  // get networkVersion() {
  //   return this.#networkVersion
  // }

  constructor(secureClientSender: TransportSender<SECURE_EVM_EVENTS>) {
    super();

    this.#requestManager = new InjectedRequestManager(
      CHANNEL_ETHEREUM_RPC_REQUEST,
      CHANNEL_ETHEREUM_RPC_RESPONSE
    );

    this.#connectionRequestManager = new InjectedRequestManager(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
    );
    // need this line because this.#connectionRequestManager isn't actually used?
    this.#connectionRequestManager;

    // Init Notification Channel
    window.addEventListener(
      "message",
      this.#handleBackpackNotification.bind(this)
    );

    // Sometimes we want to pretend to be MetaMask
    // this.isMetaMask = originRequiresMetaMask.some((host) =>
    //   window.location.host.includes(host)
    // );

    this.#secureClientSender = secureClientSender;
    this.#secureEthereumClient = new EthereumClient(this.#secureClientSender);
    this.#provider = this.#secureEthereumClient.getProvider();

    this.#secureEthereumClient
      .backpack_should_be_metamask()
      .then((shouldBeMetaMask) => {
        this.#shouldBeMetaMask = shouldBeMetaMask;
      })
      .catch(() => null);
  }

  //
  // Public methods
  //

  // Not part of EIP-1193 but exposed by Metamask
  public isConnected() {
    return this.#isConnected && this.#accounts.length >= 1;
  }

  // Deprecated EIP-1193 method
  public enable = async (): Promise<unknown> => {
    return this.request({ method: "eth_requestAccounts" });
  };

  // Deprecated EIP-1193 method
  public send = (
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
  public sendAsync = (
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
  public request = async (
    args: RequestArguments,
    accountOverride?: {
      publicKey?: string;
      uuid?: string;
    }
  ): Promise<JsonRpcResponse> => {
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
      !Array.isArray(params)
      // (typeof params !== "object" || params === null)
    ) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestParams(),
        data: args,
      });
    }
    const account = accountOverride?.publicKey || this.#accounts[0];
    const signer = this.#secureEthereumClient.getSigner(
      account,
      accountOverride?.uuid
    );

    const overrittenStandardMethods = {
      // Handle Manually:
      eth_accounts: this.#handleEthGetAccounts,
      wallet_getSnaps: async () => {
        throw new Error("wallet_getSnaps not implemented");
      },
      eth_requestAccounts: this.#handleEthRequestAccounts,
      personal_sign: async (messageHex: string, _address: string) =>
        this.#handleEthSignMessage(messageHex, signer),
      eth_signTransaction: (transaction: TransactionRequest | any) =>
        this.#handleEthSignTransaction(transaction, signer),
      eth_sendTransaction: (transaction: TransactionRequest | any) =>
        this.#handleEthSendTransaction(transaction, signer),
      wallet_switchEthereumChain: ({ chainId }) =>
        this.#handleEthSwitchChain(chainId),
      eth_signTypedData_v4: async (_address: string, messageHex: string) =>
        this.#handleEthSignTypedDataV4(_address, messageHex, signer),

      // Not supported
      eth_sign: async (_address: string, _message: string) => {
        // This is a significant security risk because it can be used to
        // sign transactions.
        // TODO maybe enable this with a large warning in the UI?
        throw new Error(
          "Backpack does not support eth_sign due to security concerns"
        );
      },
    };

    const func = overrittenStandardMethods[method];

    if (func === undefined) {
      return this.#provider
        ?.send(method, params ?? [])
        .then((result) => {
          console.log("result", result);
          return result;
        })
        .catch((error) => {
          console.error("rpc response error", error);
          throw error;
        });
    }
    return func(...(params ?? []));
  };

  //
  // Private methods
  //
  // #getProvider = (): JsonRpcApiProvider => {
  //   if (!this.isConnected() || !this.#provider) {
  //     throw ethErrors.provider.disconnected({
  //       message: messages.errors.disconnected(),
  //     });
  //   }
  //   return this.#provider;
  // };

  /**
   *  Handle notifications from Backpack.
   */
  #handleBackpackNotification = (event: Event) => {
    if (!isValidEventOrigin(event)) return;
    if (event.data.type !== CHANNEL_ETHEREUM_NOTIFICATION) return;
    logger.debug("notification", event);

    switch (event.data.detail.name) {
      case NOTIFICATION_CONNECTION_URL_UPDATED:
      case NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED:
        this.#handleNotificationConnectionUpdated(event);
        return;
      case NOTIFICATION_ACTIVE_WALLET_UPDATED:
        this.#handleNotificationActiveWalletUpdated(event);
        return;
      default:
        console.warn(`unexpected notification ${event.data.detail.name}`);
    }
  };

  /**
   * Handle wallet_switch requests
   */
  #handleEthGetAccounts = async () => {
    try {
      const { accounts, chainId } =
        await this.#secureEthereumClient.eth_getAccounts();

      if (accounts.length > 0) {
        this.#isConnected = true;
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect
        this.emit("connect", { chainId } as ProviderConnectInfo);

        this.#updateChainId(chainId);
        this.#updateAccounts(accounts);
      }

      return this.#accounts;
    } catch (_e) {
      return [];
    }
  };

  #handleEthRequestAccounts = async () => {
    // Send request to the RPC API.
    if (this.isConnected()) {
      return this.#accounts;
    }

    const impersonatingMetaMask =
      !this.backpackRecognized &&
      this.#metaMaskRecognized &&
      this.#shouldBeMetaMask;

    const result = await this.#secureEthereumClient.eth_requestAccounts({
      blockchain: Blockchain.ETHEREUM,
      impersonatingMetaMask,
    });

    const { accounts, chainId } = result;

    this.#isConnected = true;
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect
    this.emit("connect", { chainId } as ProviderConnectInfo);

    this.#updateChainId(chainId);
    this.#updateAccounts(accounts);

    return this.#accounts;
  };

  /**
   * Handle a change of the RPC connection URL or chainId in Backpack. This may also be a change
   * of the chainId/network if the change was to a different network RPC.
   */
  #handleNotificationConnectionUpdated = async (event: any) => {
    const { chainId, blockchain } = event.data.detail.data;

    if (blockchain !== Blockchain.ETHEREUM) {
      return;
    }

    this.#updateChainId(chainId);
  };

  /**
   * Handle a change of the active wallet in Backpack.
   */
  #handleNotificationActiveWalletUpdated = async (event: any) => {
    const { activeWallet, blockchain } = event.data.detail.data;

    if (blockchain !== Blockchain.ETHEREUM) {
      return;
    }

    this.#updateAccounts([activeWallet]);
  };

  /**
   * Update local state and emit required event for chain change.
   */
  #updateChainId = (chainId: string) => {
    if (chainId !== this.#chainId) {
      this.#chainId = chainId;

      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#chainchanged
      this.emit("chainChanged", chainId);
    }
  };

  /**
   * Emit the required event for a change of accounts.
   */
  #updateAccounts = (accounts: string[]) => {
    if (this.#accounts[0] !== accounts[0]) {
      this.#accounts = accounts;

      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#accountschanged
      this.emit("accountsChanged", this.#accounts);
    }
  };

  /**
   * Handle wallet_switchEthereumChain requests
   */
  #handleEthSwitchChain = async (chainId) => {
    // Send request to the RPC API.
    const response = await this.#requestManager.request({
      method: ETHEREUM_RPC_METHOD_SWITCH_CHAIN,
      params: [chainId],
    });

    return response;
  };

  /**
   * Handle eth_sign, eth_signTypedData, personal_sign RPC requests.
   */
  #handleEthSignMessage = async (
    messageHex: string,
    signer: ReturnType<EthereumClient["getSigner"]>
  ) => {
    if (!this.isConnected()) {
      throw new Error("wallet not connected");
    }

    return signer.signMessage(messageHex);
  };

  /**
   * Handle eth_sign, eth_signTypedData, personal_sign RPC requests.
   */
  #handleEthSignTypedDataV4 = async (
    _address: string,
    messageHex: string,
    signer: ReturnType<EthereumClient["getSigner"]>
  ) => {
    if (!this.isConnected()) {
      throw new Error("wallet not connected");
    }

    // This is probably not legit and should use signTypedData..
    return signer.signMessage(messageHex);
  };

  /**
   * Handle eth_signTransaction RPC requests.
   */
  #handleEthSignTransaction = async (
    transaction: TransactionLike<string>,
    signer: ReturnType<EthereumClient["getSigner"]>
  ) => {
    if (!this.isConnected()) {
      throw new Error("wallet not connected");
    }

    return signer.signTransaction(transaction);
  };

  /**
   * Handle eth_signTransaction RPC requests.
   */
  #handleEthSendTransaction = async (
    transaction: TransactionRequest,
    signer: ReturnType<EthereumClient["getSigner"]>
  ) => {
    if (!this.isConnected()) {
      throw new Error("wallet not connected");
    }

    return signer.sendTransaction(transaction);
  };
}
