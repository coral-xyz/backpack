import type { EventEmitter, Notification } from "@coral-xyz/common";
import {
  BACKEND_EVENT,
  Blockchain,
  fetchEthereumBalances,
  getLogger,
  NOTIFICATION_BLOCKCHAIN_DISABLED,
  NOTIFICATION_BLOCKCHAIN_ENABLED,
  NOTIFICATION_BLOCKCHAIN_SETTINGS_UPDATED,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE,
  NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
} from "@coral-xyz/common";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";

import type { CachedValue } from "../types";

const logger = getLogger("ethereum-connection-backend");

export const ETHEREUM_TOKENS_REFRESH_INTERVAL = 10 * 1000;
export const ETHEREUM_FEE_DATA_REFRESH_INTERVAL = 20 * 1000;

export function start(events: EventEmitter): EthereumConnectionBackend {
  const b = new EthereumConnectionBackend(events);
  b.start();
  return b;
}

export class EthereumConnectionBackend {
  private cache = new Map<string, CachedValue<any>>();
  private connectionUrl?: string;
  private chainId?: string;
  private activeWallet: string;
  private pollIntervals: Array<any>;
  private events: EventEmitter;
  public provider?: ethers.providers.JsonRpcProvider;

  constructor(events: EventEmitter) {
    this.pollIntervals = [];
    this.events = events;
  }

  public start() {
    this.setupEventListeners();
  }

  //
  // The connection backend needs to change its behavior based on what happens
  // in the core backend. E.g., if the keyring store gets locked, then we
  // need to stop polling.
  //
  private setupEventListeners() {
    this.events.addListener(BACKEND_EVENT, (notif: Notification) => {
      logger.debug(`received notification: ${notif.name}`, notif);

      switch (notif.name) {
        case NOTIFICATION_KEYRING_STORE_CREATED:
          handleKeyringStoreCreated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked();
          break;
        case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_ENABLED:
          handleBlockchainEnabled(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_DISABLED:
          handleBlockchainDisabled(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_SETTINGS_UPDATED:
          handleBlockchainSettingsUpdated(notif);
          break;
        default:
          break;
      }
    });

    const handleKeyringStoreCreated = (notif: Notification) => {
      handleKeyringStoreUnlocked(notif);
    };

    const handleKeyringStoreUnlocked = async (notif: Notification) => {
      const { blockchainActiveWallets, blockchainSettings } = notif.data;
      const activeWallet = blockchainActiveWallets[Blockchain.ETHEREUM];
      const settings = blockchainSettings[Blockchain.ETHEREUM];
      this.provider = new ethers.providers.JsonRpcProvider(
        settings.connectionUrl
      );
      this.connectionUrl = settings.connectionUrl;
      this.chainId = settings.chainId;
      if (activeWallet) {
        this.activeWallet = activeWallet;
        this.startPolling(activeWallet);
      }
    };

    const handleKeyringStoreLocked = () => {
      this.stopPolling();
    };

    const handleActiveWalletUpdated = (notif: Notification) => {
      const { activeWallet } = notif.data;
      this.activeWallet = activeWallet;
      this.stopPolling();
      this.startPolling(activeWallet);
    };

    const handleBlockchainEnabled = (notif: Notification) => {
      const { blockchain, activeWallet } = notif.data;
      this.activeWallet = activeWallet;
      if (blockchain === Blockchain.ETHEREUM) {
        // Start polling if Ethereum was enabled in wallet settings
        this.startPolling(activeWallet);
      }
    };

    const handleBlockchainDisabled = (notif: Notification) => {
      const { blockchain } = notif.data;
      if (blockchain === Blockchain.ETHEREUM) {
        // Stop polling if Ethereum was disabled in wallet settings
        this.stopPolling();
      }
    };

    const handleBlockchainSettingsUpdated = (notif: Notification) => {
      const { blockchain, prevSettings, newSettings } = notif.data;
      if (blockchain !== Blockchain.ETHEREUM) return;

      let didChange = false;
      // Check for connection URL change
      if (prevSettings.connectionUrl !== newSettings.connectionUrl) {
        logger.debug(
          "ethereum connection url changed",
          newSettings.connectionUrl
        );
        this.provider = new ethers.providers.JsonRpcProvider(
          newSettings.connectionUrl
        );
        this.connectionUrl = newSettings.connectionUrl;

        didChange = true;
      }
      // Check for chain ID change
      if (prevSettings.chainId !== newSettings.chainId) {
        logger.debug("ethereum chain id changed", newSettings.chainId);
        this.provider = new ethers.providers.JsonRpcProvider(
          this.connectionUrl,
          parseInt(newSettings.chainId)
        );
        this.chainId = newSettings.chainId;
        didChange = true;
      }

      // Restart polling if something changed to trigger an immediate update
      if (didChange) {
        this.stopPolling();
        this.startPolling(this.activeWallet);
      }
    };
  }

  //
  // Poll for data in the background script so that, even if the popup closes
  // the data is still fresh.
  //
  private async startPolling(activeWallet: string) {
    this.pollIntervals.push(
      setInterval(async () => {
        if (!this.provider) {
          return;
        }
        const data = await fetchEthereumBalances(this.provider, activeWallet);
        const key = JSON.stringify({
          url: this.connectionUrl,
          method: "ethereumTokens",
          args: [activeWallet],
        });
        this.cache.set(key, {
          ts: Date.now(),
          value: data,
        });
        this.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE,
          data: {
            balances: Object.fromEntries(data),
          },
        });
      }, ETHEREUM_TOKENS_REFRESH_INTERVAL)
    );

    this.pollIntervals.push(
      setInterval(async () => {
        if (!this.provider) {
          return;
        }
        const feeData = await this.provider.getFeeData();
        const key = JSON.stringify({
          url: this.connectionUrl,
          chainId: this.chainId,
          method: "ethereumFeeData",
        });
        this.cache.set(key, {
          ts: Date.now(),
          value: feeData,
        });
        this.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE,
          data: {
            feeData,
          },
        });
      }, ETHEREUM_FEE_DATA_REFRESH_INTERVAL)
    );
  }

  private stopPolling() {
    this.pollIntervals.forEach((interval: number) => {
      clearInterval(interval);
    });
  }

  async sendTransaction(signedTx: string) {
    return await this.provider!.sendTransaction(signedTx);
  }

  //
  // Ethereum Connection API.
  //
  async getBalance(address: string, blockTag?: string) {
    return await this.provider!.getBalance(address, blockTag);
  }

  async getCode(address: string, blockTag?: string) {
    return await this.provider!.getCode(address, blockTag);
  }

  async getStorageAt(address: string, position: BigNumber, blockTag?: string) {
    return await this.provider!.getStorageAt(address, position, blockTag);
  }

  async getTransactionCount(address: string, blockTag?: string) {
    return await this.provider!.getTransactionCount(address, blockTag);
  }

  async getBlock(block: number) {
    return await this.provider!.getBlock(block);
  }

  async getBlockWithTransactions(block: number) {
    return await this.provider!.getBlockWithTransactions(block);
  }

  async lookupAddress(name: string) {
    return await this.provider!.lookupAddress(name);
  }

  async resolveName(name: string) {
    return await this.provider!.resolveName(name);
  }

  async getNetwork() {
    return await this.provider!.getNetwork();
  }

  async getBlockNumber() {
    return await this.provider!.getBlockNumber();
  }

  async getGasPrice() {
    return await this.provider!.getGasPrice();
  }

  async getFeeData() {
    return await this.provider!.getFeeData();
  }

  async call(tx: any, blockTag?: string) {
    return await this.provider!.call(tx, blockTag);
  }

  async estimateGas(tx: any) {
    return await this.provider!.estimateGas(tx);
  }

  async getTransaction(hash: any) {
    return await this.provider!.getTransaction(hash);
  }

  async getTransactionReceipt(hash: string) {
    return await this.provider!.getTransactionReceipt(hash);
  }

  async waitForTransaction(hash: string, confirms?: number, timeout?: number) {
    return await this.provider!.waitForTransaction(hash, confirms, timeout);
  }
}
