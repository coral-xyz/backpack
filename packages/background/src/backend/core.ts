import * as bs58 from "bs58";
import type { Commitment, SendOptions } from "@solana/web3.js";
import { PublicKey, Transaction } from "@solana/web3.js";
import type { NamedPublicKey, KeyringStoreState } from "@coral-xyz/recoil";
import { makeDefaultNav } from "@coral-xyz/recoil";
import type { DerivationPath, EventEmitter } from "@coral-xyz/common";
import {
  BACKEND_EVENT,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_CONNECTION_URL_UPDATED,
} from "@coral-xyz/common";
import type { NavData } from "../keyring/store";
import {
  BLOCKCHAIN_SOLANA,
  KeyringStore,
  getNavData,
  setNavData,
  setNav,
  getNav,
} from "../keyring/store";
import type { Backend as SolanaConnectionBackend } from "../backend/solana-connection";

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

  async isApprovedOrigin(origin: string): Promise<boolean> {
    return await this.keyringStore.isApprovedOrigin(origin);
  }

  disconnect() {
    // todo
    return SUCCESS_RESPONSE;
  }

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

  // Returns the signature.
  async signTransaction(
    txMessage: string,
    walletAddress: string
  ): Promise<string> {
    const blockchainKeyring = this.keyringStore.activeBlockchain();
    return await blockchainKeyring.signTransaction(txMessage, walletAddress);
  }

  async signAllTransactions(
    txMessages: Array<string>,
    walletAddress: string
  ): Promise<Array<string>> {
    const blockchainKeyring = this.keyringStore.activeBlockchain();
    return await Promise.all(
      txMessages.map((t) => blockchainKeyring.signTransaction(t, walletAddress))
    );
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

  async recentBlockhash(commitment?: Commitment): Promise<string> {
    const { blockhash } = await this.solanaConnectionBackend.getLatestBlockhash(
      commitment
    );
    return blockhash;
  }

  async solanaConnectionUrl(): Promise<string> {
    const blockchain = this.keyringStore.blockchains.get(BLOCKCHAIN_SOLANA);
    const url = await blockchain!.connectionUrlRead();
    return url;
  }

  // Creates a brand new keyring store. Should be run once on initializtion.
  async keyringStoreCreate(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string
  ): Promise<string> {
    await this.keyringStore.init(mnemonic, derivationPath, password);
    return SUCCESS_RESPONSE;
  }

  async keyringStoreUnlock(password: string): Promise<string> {
    await this.keyringStore.tryUnlock(password);

    const url = await this.solanaConnectionUrl();
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
        pubkeys.hdPublicKeys.map((pk) =>
          this.keyringStore.getKeyname(pk.toString())
        )
      ),
      Promise.all(
        pubkeys.importedPublicKeys.map((pk) =>
          this.keyringStore.getKeyname(pk.toString())
        )
      ),
      Promise.all(
        pubkeys.ledgerPublicKeys.map((pk) =>
          this.keyringStore.getKeyname(pk.toString())
        )
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

  async connectionUrlRead(): Promise<string> {
    return await this.keyringStore.connectionUrlRead();
  }

  async connectionUrlUpdate(url: string): Promise<boolean> {
    const didChange = await this.keyringStore.connectionUrlUpdate(url);
    if (didChange) {
      const activeWallet = await this.activeWallet();
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_CONNECTION_URL_UPDATED,
        data: {
          url,
          activeWallet,
        },
      });
    }
    return didChange;
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

  async keynameUpdate(publicKey: string, newName: string): Promise<string> {
    await this.keyringStore.setKeyname(publicKey, newName);
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
    return SUCCESS_RESPONSE;
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

  async keyringAutolockUpdate(secs: number): Promise<string> {
    await this.keyringStore.autoLockUpdate(secs);
    return SUCCESS_RESPONSE;
  }

  async navigationUpdate(navData: any): Promise<string> {
    const d = await getNavData(navData.id);
    if (!d) {
      throw new Error("invariant violation");
    }
    await setNavData(navData.id, navData);
    if (d.urls.length !== navData.urls.length) {
      const oldUrl = d.urls[d.urls.length - 1];
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
        data: {
          url: navData.urls[navData.urls.length - 1],
          oldUrl,
        },
      });
    }
    return SUCCESS_RESPONSE;
  }

  async navigationRead(navKey: string): Promise<NavData> {
    let nav = await getNav();
    if (!nav) {
      await setNav(defaultNav);
      nav = defaultNav;
    }
    // @ts-ignore
    return nav.data[navKey];
  }

  async navigationActiveTabRead(): Promise<string> {
    let nav = await getNav();
    if (!nav) {
      await setNav(defaultNav);
      nav = defaultNav;
    }
    // @ts-ignore
    return nav.activeTab;
  }

  async navigationActiveTabUpdate(activeTab: string): Promise<string> {
    let nav = await getNav();
    if (!nav) {
      throw new Error("invariant violation");
    }
    await setNav({
      ...nav,
      activeTab,
    });
    const navData = nav.data[activeTab];
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url: navData.urls[navData.urls.length - 1],
      },
    });

    return SUCCESS_RESPONSE;
  }

  async darkModeRead(): Promise<boolean> {
    // todo
    return true;
  }

  async darkModeUpdate(darkMode: boolean): Promise<string> {
    // todo
    return SUCCESS_RESPONSE;
  }

  async solanaCommitmentRead(): Promise<Commitment> {
    // todo
    return "processed";
  }

  async solanaCommitmentUpdate(commitment: string): Promise<string> {
    // todo
    return SUCCESS_RESPONSE;
  }

  async approvedOriginsRead(): Promise<Array<string>> {
    return await this.keyringStore.approvedOrigins();
  }

  async approvedOriginsUpdate(approvedOrigins: Array<string>): Promise<string> {
    await this.keyringStore.approvedOriginsUpdate(approvedOrigins);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_APPROVED_ORIGINS_UPDATE,
      data: {
        approvedOrigins,
      },
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

  async mnemonicCreate(): Promise<string> {
    return this.keyringStore.createMnemonic();
  }
}

export const SUCCESS_RESPONSE = "success";
const defaultNav = makeDefaultNav();
