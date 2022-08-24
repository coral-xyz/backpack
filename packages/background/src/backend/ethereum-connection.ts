import { ethers } from "ethers";
import type { Notification, EventEmitter } from "@coral-xyz/common";
import {
  ethereumBalances,
  getLogger,
  Blockchain,
  BACKEND_EVENT,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE,
} from "@coral-xyz/common";

const logger = getLogger("ethereum-connection-backend");

export const ETHEREUM_TOKENS_REFRESH_INTERVAL = 10 * 1000;

export function start(events: EventEmitter): EthereumConnectionBackend {
  const b = new EthereumConnectionBackend(events);
  b.start();
  return b;
}

export class EthereumConnectionBackend {
  private cache = new Map<string, CachedValue<any>>();
  private url?: string;
  private pollIntervals: Array<any>;
  private events: EventEmitter;
  private provider?: ethers.providers.Provider;

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
          handleKeyringStoreLocked(notif);
          break;
        case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
          handleConnectionUrlUpdated(notif);
          break;
        default:
          break;
      }
    });

    const handleKeyringStoreCreated = (notif: Notification) => {
      handleKeyringStoreUnlocked(notif);
    };

    const handleKeyringStoreUnlocked = (notif: Notification) => {
      const { blockchainActiveWallets, ethereumConnectionUrl } = notif.data;
      this.provider = new ethers.providers.JsonRpcProvider(
        ethereumConnectionUrl
      );
      this.url = ethereumConnectionUrl;
      const activeWallet = blockchainActiveWallets[Blockchain.ETHEREUM];
      if (activeWallet) {
        this.startPolling(activeWallet);
      }
    };

    const handleKeyringStoreLocked = (_notif: Notification) => {
      this.stopPolling();
    };

    const handleActiveWalletUpdated = (notif: Notification) => {
      const { activeWallet } = notif.data;
      this.stopPolling();
      this.startPolling(activeWallet);
    };

    const handleConnectionUrlUpdated = (notif: Notification) => {
      const { activeWallet, url } = notif.data;
      this.provider = new ethers.providers.JsonRpcProvider(url);
      this.url = url;
      this.stopPolling();
      this.startPolling(activeWallet);
    };
  }

  //
  // Poll for data in the background script so that, even if the popup closes
  // the data is still fresh.
  //
  private async startPolling(activeWallet: string) {
    this.pollIntervals.push(
      setInterval(async () => {
        const data = await ethereumBalances(this.provider!, [], activeWallet);
        const key = JSON.stringify({
          url: this.url,
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
            connectionUrl: this.url,
            activeWallet,
            balances: data,
          },
        });
      }, ETHEREUM_TOKENS_REFRESH_INTERVAL)
    );
  }

  private stopPolling() {
    this.pollIntervals.forEach((interval: number) => {
      clearInterval(interval);
    });
  }
}

type CachedValue<T> = {
  ts: number;
  value: T;
};
