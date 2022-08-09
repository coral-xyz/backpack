import { validateMnemonic as _validateMnemonic } from "bip39";
import * as bs58 from "bs58";
import type { Commitment, SendOptions } from "@solana/web3.js";
import { PublicKey, Transaction } from "@solana/web3.js";
import type { NamedPublicKey, KeyringStoreState } from "@coral-xyz/recoil";
import { makeDefaultNav } from "@coral-xyz/recoil";
import type { DerivationPath, EventEmitter } from "@coral-xyz/common";
import {
  SolanaCluster,
  Blockchain,
  SolanaExplorer,
  BACKEND_EVENT,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_RESET,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_AUTO_LOCK_SECS_UPDATED,
  NOTIFICATION_SOLANA_EXPLORER_UPDATED,
  NOTIFICATION_SOLANA_COMMITMENT_UPDATED,
  NOTIFICATION_DARK_MODE_UPDATED,
} from "@coral-xyz/common";
import type { Nav } from "./store";
import * as store from "./store";
import { KeyringStore } from "./keyring";
import type { Backend as SolanaConnectionBackend } from "./solana-connection";
import { getWalletData, setWalletData } from "./store";

export function start(events: EventEmitter, solanaB: SolanaConnectionBackend) {
  return new Backend(events, solanaB);
}

export class Backend {
  private keyringStore: KeyringStore;
  private solanaConnectionBackend: SolanaConnectionBackend;
  private events: EventEmitter;

  constructor(events: EventEmitter, solanaB: SolanaConnectionBackend) {
    this.keyringStore = new KeyringStore(events);
    this.solanaConnectionBackend = solanaB;
    this.events = events;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Solana Provider.
  ///////////////////////////////////////////////////////////////////////////////

  async signAndSendTx(
    txStr: string,
    walletAddress: string,
    options?: SendOptions
  ): Promise<string> {
    // Sign the transaction.
    const tx = Transaction.from(bs58.decode(txStr));
    const txMsg = bs58.encode(tx.serializeMessage());
    const signature = await this.signTransaction(txMsg, walletAddress);
    const pubkey = new PublicKey(walletAddress);
    tx.addSignature(pubkey, Buffer.from(bs58.decode(signature)));

    // Send it to the network.
    const commitment = await this.solanaCommitmentRead();
    return await this.solanaConnectionBackend.sendRawTransaction(
      tx.serialize(),
      options ?? {
        skipPreflight: false,
        preflightCommitment: commitment,
      }
    );
  }

  async signAllTransactions(
    txs: Array<string>,
    walletAddress
  ): Promise<Array<string>> {
    const signed: Array<string> = [];
    for (let k = 0; k < txs.length; k += 1) {
      signed.push(await this.signTransaction(txs[k], walletAddress));
    }
    return signed;
  }

  // Returns the signature.
  async signTransaction(
    txMessage: string,
    walletAddress: string
  ): Promise<string> {
    const blockchainKeyring = this.keyringStore.activeBlockchain();
    return await blockchainKeyring.signTransaction(txMessage, walletAddress);
  }

  async signMessage(msg: string, walletAddress: string): Promise<string> {
    const blockchainKeyring = this.keyringStore.activeBlockchain();
    return await blockchainKeyring.signMessage(msg, walletAddress);
  }

  async simulate(
    txStr: string,
    walletAddress: string,
    commitment: Commitment // TODO: use this when we have the new anchor api.
  ): Promise<any> {
    const tx = Transaction.from(bs58.decode(txStr));
    const txMsg = bs58.encode(tx.serializeMessage());
    const signature = await this.signTransaction(txMsg, walletAddress);
    const pubkey = new PublicKey(walletAddress);
    tx.addSignature(pubkey, Buffer.from(bs58.decode(signature)));

    return await this.solanaConnectionBackend.simulateTransaction(tx);
  }

  disconnect() {
    // todo
    return SUCCESS_RESPONSE;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Solana.
  ///////////////////////////////////////////////////////////////////////////////

  async recentBlockhash(commitment?: Commitment): Promise<string> {
    const { blockhash } = await this.solanaConnectionBackend.getLatestBlockhash(
      commitment
    );
    return blockhash;
  }

  async solanaConnectionUrlRead(): Promise<string> {
    const data = await getWalletData();
    return (data.solana && data.solana.cluster) ?? SolanaCluster.DEFAULT;
  }

  // Returns true if the url changed.
  async solanaConnectionUrlUpdate(cluster: string): Promise<boolean> {
    const data = await getWalletData();

    if (data.solana.cluster === cluster) {
      return false;
    }

    await setWalletData({
      ...data,
      solana: {
        ...data.solana,
        cluster,
      },
    });

    const activeWallet = await this.activeWallet();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_CONNECTION_URL_UPDATED,
      data: {
        url: cluster,
        activeWallet,
      },
    });

    return true;
  }

  async solanaExplorerRead(): Promise<string> {
    const data = await store.getWalletData();
    return data.solana && data.solana.explorer
      ? data.solana.explorer
      : SolanaExplorer.DEFAULT;
  }

  async solanaExplorerUpdate(explorer: string): Promise<string> {
    const data = await store.getWalletData();
    await store.setWalletData({
      ...data,
      solana: {
        ...data.solana,
        explorer,
      },
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_SOLANA_EXPLORER_UPDATED,
      data: {
        explorer,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async solanaCommitmentRead(): Promise<Commitment> {
    const data = await store.getWalletData();
    return data.solana && data.solana.commitment
      ? data.solana.commitment
      : "processed";
  }

  async solanaCommitmentUpdate(commitment: Commitment): Promise<string> {
    const data = await store.getWalletData();
    await store.setWalletData({
      ...data,
      solana: {
        ...data.solana,
        commitment,
      },
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_SOLANA_COMMITMENT_UPDATED,
      data: {
        commitment,
      },
    });
    return SUCCESS_RESPONSE;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Keyring.
  ///////////////////////////////////////////////////////////////////////////////

  // Creates a brand new keyring store. Should be run once on initializtion.
  async keyringStoreCreate(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string,
    accountIndices: Array<number>
  ): Promise<string> {
    await this.keyringStore.init(
      mnemonic,
      derivationPath,
      password,
      accountIndices
    );

    // Notify all listeners.
    const data = await store.getWalletData();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_CREATED,
      data: {
        url: data.solana.cluster,
        activeWallet: await this.activeWallet(),
        commitment: data.solana.commitment,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async keyringStoreCheckPassword(password: string): Promise<boolean> {
    return await this.keyringStore.checkPassword(password);
  }

  async keyringStoreUnlock(password: string): Promise<string> {
    await this.keyringStore.tryUnlock(password);
    const url = await this.solanaConnectionUrlRead();
    const activeWallet = await this.activeWallet();
    const commitment = await this.solanaCommitmentRead();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
      data: {
        url,
        activeWallet,
        commitment,
      },
    });

    return SUCCESS_RESPONSE;
  }

  keyringStoreLock() {
    this.keyringStore.lock();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_LOCKED,
    });
    return SUCCESS_RESPONSE;
  }

  async keyringStoreState(): Promise<KeyringStoreState> {
    return await this.keyringStore.state();
  }

  keyringStoreKeepAlive(): string {
    this.keyringStore.keepAlive();
    return SUCCESS_RESPONSE;
  }

  // Returns all pubkeys available for signing.
  async keyringStoreReadAllPubkeys(): Promise<{
    hdPublicKeys: Array<NamedPublicKey>;
    importedPublicKeys: Array<NamedPublicKey>;
    ledgerPublicKeys: Array<NamedPublicKey>;
  }> {
    const pubkeys = this.keyringStore.publicKeys();
    const [hdNames, importedNames, ledgerNames] = await Promise.all([
      Promise.all(
        pubkeys.hdPublicKeys.map((pk) => store.getKeyname(pk.toString()))
      ),
      Promise.all(
        pubkeys.importedPublicKeys.map((pk) => store.getKeyname(pk.toString()))
      ),
      Promise.all(
        pubkeys.ledgerPublicKeys.map((pk) => store.getKeyname(pk.toString()))
      ),
    ]);
    return {
      hdPublicKeys: pubkeys.hdPublicKeys.map((pk, idx) => {
        return {
          publicKey: pk.toString(),
          name: hdNames[idx],
        };
      }),
      importedPublicKeys: pubkeys.importedPublicKeys.map((pk, idx) => {
        return {
          publicKey: pk.toString(),
          name: importedNames[idx],
        };
      }),
      ledgerPublicKeys: pubkeys.ledgerPublicKeys.map((pk, idx) => {
        return {
          publicKey: pk.toString(),
          name: ledgerNames[idx],
        };
      }),
    };
  }

  // Adds a new HdKeyring to the store.
  hdKeyringCreate(mnemonic: string): string {
    // todo
    return SUCCESS_RESPONSE;
  }

  // Adds a new ecretKey to the store (secret key is a private not a mnemonic).
  keyringCreate(secretKey: string): string {
    // todo
    return SUCCESS_RESPONSE;
  }

  async activeWallet(): Promise<string> {
    return await this.keyringStore.activeWallet();
  }

  async activeWalletUpdate(newWallet: string): Promise<string> {
    await this.keyringStore.activeWalletUpdate(newWallet);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ACTIVE_WALLET_UPDATED,
      data: {
        activeWallet: newWallet,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringDeriveWallet(): Promise<string> {
    const [pubkey, name] = await this.keyringStore.deriveNextKey();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_DERIVED_WALLET,
      data: {
        publicKey: pubkey.toString(),
        name,
      },
    });
    // Return the newly created key.
    return pubkey.toString();
  }

  async keynameRead(publicKey: string): Promise<string> {
    const keyname = await store.getKeyname(publicKey);
    return keyname;
  }

  async keynameUpdate(publicKey: string, newName: string): Promise<string> {
    await store.setKeyname(publicKey, newName);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYNAME_UPDATE,
      data: {
        publicKey,
        name: newName,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringKeyDelete(publicKey: string): Promise<string> {
    await this.keyringStore.keyDelete(publicKey);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_KEY_DELETE,
      data: {
        publicKey,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async passwordUpdate(
    currentPassword: string,
    newPassword: string
  ): Promise<string> {
    await this.keyringStore.passwordUpdate(currentPassword, newPassword);
    return SUCCESS_RESPONSE;
  }

  async importSecretKey(secretKey: string, name: string): Promise<string> {
    const [publicKey, _name] = await this.keyringStore.importSecretKey(
      secretKey,
      name
    );
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
      data: {
        publicKey,
        name: _name,
      },
    });
    return publicKey;
  }

  keyringExportSecretKey(password: string, pubkey: string): string {
    return this.keyringStore.exportSecretKey(password, pubkey);
  }

  keyringExportMnemonic(password: string): string {
    return this.keyringStore.exportMnemonic(password);
  }

  keyringResetMnemonic(password: string): string {
    this.keyringStore.resetMnemonic(password);
    return SUCCESS_RESPONSE;
  }

  async keyringAutolockRead(): Promise<number> {
    const data = await store.getWalletData();
    return data.autoLockSecs;
  }

  async keyringAutolockUpdate(autoLockSecs: number): Promise<string> {
    await this.keyringStore.autoLockUpdate(autoLockSecs);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_AUTO_LOCK_SECS_UPDATED,
      data: {
        autoLockSecs,
      },
    });
    return SUCCESS_RESPONSE;
  }

  keyringReset(): string {
    this.keyringStore.reset();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_RESET,
    });
    return SUCCESS_RESPONSE;
  }

  async ledgerConnect() {
    await this.keyringStore.ledgerConnect();
    return SUCCESS_RESPONSE;
  }

  async ledgerImport(dPath: string, account: number, pubkey: string) {
    await this.keyringStore.ledgerImport(dPath, account, pubkey);
    return SUCCESS_RESPONSE;
  }

  validateMnemonic(mnemonic: string): boolean {
    return _validateMnemonic(mnemonic);
  }

  async mnemonicCreate(strength: number): Promise<string> {
    return this.keyringStore.createMnemonic(strength);
  }

  async previewPubkeys(
    mnemonic: string,
    derivationPath: DerivationPath,
    numberOfAccounts: number
  ) {
    return this.keyringStore.previewPubkeys(
      mnemonic,
      derivationPath,
      numberOfAccounts
    );
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Preferences.
  ///////////////////////////////////////////////////////////////////////////////

  async darkModeRead(): Promise<boolean> {
    const data = await store.getWalletData();
    return data.darkMode ?? true;
  }

  async darkModeUpdate(darkMode: boolean): Promise<string> {
    const data = await store.getWalletData();
    await store.setWalletData({
      ...data,
      darkMode,
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_DARK_MODE_UPDATED,
      data: {
        darkMode,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async isApprovedOrigin(origin: string): Promise<boolean> {
    const data = await store.getWalletData();
    if (!data.approvedOrigins) {
      return false;
    }
    const found = data.approvedOrigins.find((o) => o === origin);
    return found !== undefined;
  }

  async approvedOriginsRead(): Promise<Array<string>> {
    const data = await store.getWalletData();
    return data.approvedOrigins;
  }

  async approvedOriginsUpdate(approvedOrigins: Array<string>): Promise<string> {
    const data = await store.getWalletData();
    await store.setWalletData({
      ...data,
      approvedOrigins,
    });

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_APPROVED_ORIGINS_UPDATE,
      data: {
        approvedOrigins,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async approvedOriginsDelete(origin: string): Promise<string> {
    const data = await store.getWalletData();
    const approvedOrigins = data.approvedOrigins.filter((o) => o !== origin);
    await store.setWalletData({
      ...data,
      approvedOrigins,
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_APPROVED_ORIGINS_UPDATE,
      data: {
        approvedOrigins,
      },
    });
    return SUCCESS_RESPONSE;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Navigation.
  ///////////////////////////////////////////////////////////////////////////////

  async navigationPush(url: string): Promise<string> {
    let nav = await store.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }
    nav.data[nav.activeTab].urls.push(url);
    await store.setNav(nav);
    url = setSearchParam(url, "nav", "push");

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async navigationPop(): Promise<string> {
    let nav = await store.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }
    nav.data[nav.activeTab].urls.pop();
    await store.setNav(nav);

    const urls = nav.data[nav.activeTab].urls;
    let url = urls[urls.length - 1];
    url = setSearchParam(url, "nav", "pop");

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async navigationToRoot(): Promise<string> {
    let nav = await store.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }
    const urls = nav.data[nav.activeTab].urls;
    if (urls.length <= 1) {
      return SUCCESS_RESPONSE;
    }

    let url = urls[0];
    nav.data[nav.activeTab].urls = [url];
    await store.setNav(nav);

    url = setSearchParam(url, "nav", "pop");
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async navRead(): Promise<Nav> {
    let nav = await store.getNav();
    if (!nav) {
      await store.setNav(defaultNav);
      nav = defaultNav;
    }
    // @ts-ignore
    return nav;
  }

  async navigationActiveTabUpdate(activeTab: string): Promise<string> {
    const currNav = await store.getNav();
    if (!currNav) {
      throw new Error("invariant violation");
    }
    const nav = {
      ...currNav,
      activeTab,
    };
    await store.setNav(nav);
    const navData = nav.data[activeTab];
    let url = navData.urls[navData.urls.length - 1];
    url = setSearchParam(url, "nav", "tab");

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async navigationCurrentUrlUpdate(url: string): Promise<string> {
    // Get the tab nav.
    const currNav = await store.getNav();
    if (!currNav) {
      throw new Error("invariant violation");
    }

    // Update the active tab's nav stack.
    const navData = currNav.data[currNav.activeTab];
    navData.urls[navData.urls.length - 1] = url;
    currNav.data[currNav.activeTab] = navData;

    // Save the change.
    await store.setNav(currNav);

    // Notify listeners.
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url,
        nav: "tab",
      },
    });

    return SUCCESS_RESPONSE;
  }

  async pluginLocalStorageGet(plugin: string, key: string): Promise<any> {
    return await store.LocalStorageDb.get(`${plugin}:${key}`);
  }

  async pluginLocalStoragePut(
    plugin: string,
    key: string,
    value: any
  ): Promise<any> {
    await store.LocalStorageDb.set(`${plugin}:${key}`, value);
    return SUCCESS_RESPONSE;
  }
}

export const SUCCESS_RESPONSE = "success";
const defaultNav = makeDefaultNav();

function setSearchParam(url: string, key: string, value: string): string {
  const [path, search] = url.split("?");
  const searchParams = new URLSearchParams(search);
  searchParams.delete(key);
  searchParams.append(key, value);
  return `${path}?${searchParams.toString()}`;
}
