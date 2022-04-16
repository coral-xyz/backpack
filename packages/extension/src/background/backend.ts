import * as bs58 from "bs58";
import {
  Commitment,
  PublicKey,
  Transaction,
  SendOptions,
} from "@solana/web3.js";
import { Context, DerivationPath } from "@200ms/common";
import {
  BLOCKCHAIN_SOLANA,
  KeyringStore,
  KeyringStoreState,
  getNavData,
  setNavData,
  setNav,
  getNav,
  NavData,
} from "../keyring/store";
import {
  BACKEND_EVENT,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  TAB_BALANCES,
  TAB_QUEST,
  TAB_BRIDGE,
  TAB_FRIENDS,
} from "../common";
import { Io } from "./io";
import { BACKEND as SOLANA_CONNECTION_BACKEND } from "./solana-connection/backend";

export class Backend {
  private keyringStore: KeyringStore;

  constructor() {
    this.keyringStore = new KeyringStore();
  }

  async isApprovedOrigin(origin: string): Promise<boolean> {
    return await this.keyringStore.isApprovedOrigin(origin);
  }

  disconnect(ctx: Context) {
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
    return await SOLANA_CONNECTION_BACKEND.sendRawTransaction(
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

  async signMessage(
    ctx: Context,
    msg: string,
    walletAddress: string
  ): Promise<string> {
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

    return await SOLANA_CONNECTION_BACKEND.simulateTransaction(tx);
  }

  async recentBlockhash(commitment?: Commitment): Promise<string> {
    const { blockhash } = await SOLANA_CONNECTION_BACKEND.getLatestBlockhash(
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

  async keyringStoreUnlock(password: string): Promise<String> {
    await this.keyringStore.tryUnlock(password);

    const url = await this.solanaConnectionUrl();
    const activeWallet = await this.activeWallet();
    const commitment = await this.solanaCommitmentRead();

    Io.events.emit(BACKEND_EVENT, {
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
    Io.events.emit(BACKEND_EVENT, {
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
      Io.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_CONNECTION_URL_UPDATED,
        data: {
          url,
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
    Io.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ACTIVE_WALLET_UPDATED,
      data: {
        activeWallet: newWallet,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringDeriveWallet(): Promise<string> {
    const [pubkey, name] = await this.keyringStore.deriveNextKey();
    Io.events.emit(BACKEND_EVENT, {
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
    Io.events.emit(BACKEND_EVENT, {
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
    Io.events.emit(BACKEND_EVENT, {
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
    Io.events.emit(BACKEND_EVENT, {
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
    Io.events.emit(BACKEND_EVENT, {
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
}

// type MessageSignature = string;
export type NamedPublicKey = {
  publicKey: string;
  name: string;
};

export const TABS = [
  [TAB_BALANCES, "Balances"],
  [TAB_BRIDGE, "Bridge"],
  [TAB_QUEST, "Quest"],
  [TAB_FRIENDS, "Friends"],
];
const defaultNav = makeDefaultNav();

function makeDefaultNav() {
  const defaultNav: any = {
    activeTab: TAB_BALANCES,
    data: {},
  };
  TABS.forEach(([tabName, tabTitle]) => {
    defaultNav.data[tabName] = {
      id: tabName,
      title: tabTitle,
      components: [],
      props: [],
      titles: [],
      transition: "init",
    };
  });
  return defaultNav;
}

export const SUCCESS_RESPONSE = "success";

//
// Backend singleton.
//
export const BACKEND = new Backend();
