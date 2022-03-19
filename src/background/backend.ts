import {
  KeyringStore,
  KeyringStoreState,
  getNavData,
  setNavData,
  setNav,
  getNav,
  NavData,
} from "../keyring/store";
import { DerivationPath } from "../keyring/crypto";
import {
  NotificationsClient,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  TAB_BALANCES,
  TAB_QUEST,
  TAB_BRIDGE,
  TAB_FRIENDS,
} from "../common";

const SUCCESS_RESPONSE = "success";

export class Backend {
  private keyringStore: KeyringStore;
  private notifications: NotificationsClient;

  constructor(notifications: NotificationsClient) {
    this.keyringStore = new KeyringStore(notifications);
    this.notifications = notifications;
  }

  connect(ctx: Context, onlyIfTrustedMaybe: boolean) {
    // todo
    return SUCCESS_RESPONSE;
  }

  disconnect(ctx: Context) {
    // todo
    return SUCCESS_RESPONSE;
  }

  signAndSendTx(ctx: Context, tx: any): string {
    // todo
    const txId = "todo";
    return txId;
  }

  signMessage(ctx: Context, msg: any): MessageSignature {
    // todo
    const signature = "todo";
    return signature;
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
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
    });
    return SUCCESS_RESPONSE;
  }

  keyringStoreLock() {
    this.keyringStore.lock();
    this.notifications.pushNotification({
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
  }> {
    const pubkeys = this.keyringStore.publicKeys();
    const [hdNames, importedNames] = await Promise.all([
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
    return await this.keyringStore.connectionUrlUpdate(url);
  }

  async activeWallet(): Promise<string> {
    return await this.keyringStore.activeWallet();
  }

  async activeWalletUpdate(newWallet: string): Promise<string> {
    await this.keyringStore.activeWalletUpdate(newWallet);
    this.notifications.pushNotification({
      name: NOTIFICATION_ACTIVE_WALLET_UPDATED,
      data: {
        activeWallet: newWallet,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringDeriveWallet(): Promise<string> {
    const [pubkey, name] = await this.keyringStore.deriveNextKey();
    this.notifications.pushNotification({
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
    this.notifications.pushNotification({
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
    this.notifications.pushNotification({
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
    this.notifications.pushNotification({
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
}

export type Context = {
  sender: any;
};

type MessageSignature = string;
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
