import { PublicKey } from "@solana/web3.js";
import { BrowserRuntime } from "../common/browser";
import * as crypto from "./crypto";
import { DerivationPath } from "./crypto";
import { HdKeyring, Keyring } from ".";
import {
  NotificationsClient,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
} from "../common";

const LOCK_INTERVAL_SECS = 15 * 60 * 1000;

export class KeyringStore {
  private notifications: NotificationsClient;
  private lastUsedTs: number;
  private hdKeyring?: HdKeyring;
  private importedKeyring?: Keyring;
  private password?: string;

  constructor(notifications: NotificationsClient) {
    this.notifications = notifications;
    this.lastUsedTs = 0;

    // Check the last time the keystore was used at a regular interval.
    // If it hasn't been used recently, lock the keystore.
    const interval = setInterval(() => {
      const currentTs = Date.now() / 1000;
      if (currentTs - this.lastUsedTs >= LOCK_INTERVAL_SECS) {
        this.lock();
        notifications.pushNotification({
          name: NOTIFICATION_KEYRING_STORE_LOCKED,
        });
        clearInterval(interval);
      }
    }, LOCK_INTERVAL_SECS);
  }

  public async state(): Promise<KeyringStoreState> {
    if (this.isUnlocked()) {
      return KeyringStoreStateEnum.Unlocked;
    }
    if (await this.isLocked()) {
      return KeyringStoreStateEnum.Locked;
    }
    return KeyringStoreStateEnum.NeedsOnboarding;
  }

  public publicKeys(): {
    hdPublicKeys: Array<PublicKey>;
    importedPublicKeys: Array<PublicKey>;
  } {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    const hdPublicKeys = this.hdKeyring!.publicKeys();
    const importedPublicKeys = this.importedKeyring!.publicKeys();
    return {
      hdPublicKeys,
      importedPublicKeys,
    };
  }

  public lock() {
    this.hdKeyring = undefined;
    this.importedKeyring = undefined;
    this.lastUsedTs = 0;
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYRING_STORE_LOCKED,
    });
  }

  public async tryUnlock(password: string) {
    if (this.isUnlocked()) {
      throw new Error("unable to unlock");
    }

    // Decrypt the keyring from storage.
    const ciphertextPayload = await LocalStorageDb.get(KEY_KEYRING_STORE);
    if (ciphertextPayload === undefined || ciphertextPayload === null) {
      throw new Error("keyring store not found on disk");
    }
    const plaintext = await crypto.decrypt(ciphertextPayload, password);
    const { hdKeyring, importedKeyring, lastUsedTs: _ } = JSON.parse(plaintext);

    // Update the keystore object with the keyrings.
    this.hdKeyring = HdKeyring.fromJson(hdKeyring);
    this.importedKeyring = Keyring.fromJson(importedKeyring);
    this.password = password;

    // Notify all listeners of the unlock.
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
    });

    // Update last used ts.
    this.updateLastUsed();
  }

  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string
  ) {
    if (this.isUnlocked()) {
      throw new Error("unable to initialize");
    }

    // Initialize keyrings.
    this.hdKeyring = HdKeyring.fromMnemonic(mnemonic, derivationPath);
    this.importedKeyring = Keyring.fromSecretKeys([]);
    this.password = password;

    // Persist the encrypted data to then store.
    this.persist();

    // Give a name to this wallet.
    await KeynameStore.setName(this.hdKeyring.getPublicKey(0), "Wallet 1");

    // Initialize the wallet ui metadata.
    await setWalletData({
      activeWallet: this.hdKeyring.getPublicKey(0).toString(),
      deletedWallets: [],
    });

    // Update last used timestamp.
    this.updateLastUsed();
  }

  public keepAlive() {
    this.updateLastUsed();
  }

  public deriveNextKey(): [PublicKey, number] {
    if (!this.isUnlocked()) {
      throw new Error("keyring not unlocked");
    }
    const [pubkey, accountIndex] = this.hdKeyring!.deriveNext();
    this.persist();

    // Update last used timestamp.
    this.updateLastUsed();
    return [pubkey, accountIndex];
  }

  // Returns the public key of the secret key imported.
  public importSecretKey(secretKey: string): PublicKey {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    const pubkey = this.importedKeyring!.importSecretKey(secretKey);
    return pubkey;
  }

  private updateLastUsed() {
    this.lastUsedTs = Date.now() / 1000;
  }

  private toJson(): any {
    if (!this.hdKeyring || !this.importedKeyring) {
      throw new Error("keyring store is locked");
    }
    return {
      hdKeyring: this.hdKeyring.toJson(),
      importedKeyring: this.importedKeyring.toJson(),
      lastUsedTs: this.lastUsedTs,
    };
  }

  private isUnlocked(): boolean {
    return (
      this.hdKeyring !== undefined ||
      this.importedKeyring !== undefined ||
      this.lastUsedTs !== 0
    );
  }

  private async isLocked(): Promise<boolean> {
    if (this.isUnlocked()) {
      return false;
    }
    const ciphertext = await LocalStorageDb.get(KEY_KEYRING_STORE);
    return ciphertext !== undefined && ciphertext !== null;
  }

  private async persist() {
    if (!this.isUnlocked()) {
      throw new Error("invariant violation");
    }
    const plaintext = JSON.stringify(this.toJson());
    const ciphertext = await crypto.encrypt(plaintext, this.password!);
    await LocalStorageDb.set(KEY_KEYRING_STORE, ciphertext);
  }
}

export class KeynameStore {
  public static async setName(pubkey: PublicKey, name: string) {
    let keynames = await LocalStorageDb.get(KEY_KEYNAME_STORE);
    if (!keynames) {
      keynames = {};
    }
    keynames[pubkey.toString()] = name;
    await LocalStorageDb.set(KEY_KEYNAME_STORE, keynames);
  }

  public static async getName(pubkey: PublicKey): Promise<string> {
    const names = await LocalStorageDb.get(KEY_KEYNAME_STORE);
    const name = names[pubkey.toString()];
    if (!name) {
      throw new Error(`unable to find name for key: ${pubkey.toString()}`);
    }
    return name;
  }
}

export async function getWalletData(): Promise<WalletData> {
  const data = await LocalStorageDb.get(KEY_WALLET_DATA);
  return data;
}

export async function setWalletData(data: WalletData) {
  await LocalStorageDb.set(KEY_WALLET_DATA, data);
}

// Keys used by the local storage db.
export const KEY_KEYRING_STORE = "keyring-store";
export const KEY_KEYNAME_STORE = "keyname-store";
export const KEY_CONNECTION_URL = "connection-url";
export const KEY_WALLET_DATA = "wallet-data";

export class LocalStorageDb {
  static async get(key: string): Promise<any> {
    return await BrowserRuntime.getLocalStorage(key);
  }

  static async set(key: string, value: any): Promise<void> {
    await BrowserRuntime.setLocalStorage(key, value);
  }
}

export const KeyringStoreStateEnum: { [key: string]: KeyringStoreState } = {
  Locked: "locked",
  Unlocked: "unlocked",
  NeedsOnboarding: "needs-onboarding",
};
export type KeyringStoreState = "locked" | "unlocked" | "needs-onboarding";

// Persistent metadata for the UI.
export type WalletData = {
  activeWallet: string;
  deletedWallets: Array<string>;
};
