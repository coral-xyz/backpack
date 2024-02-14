// DO NOT ADD ANYTHING NEW TO THIS FILE.
// Its replaced by the secure-* stack and will be completely removed asap

// To add/update user preferences use: userClient.updateUserPreferences();

//             uuuuuuuuuuuuuuuuuuuu
//           u" uuuuuuuuuuuuuuuuuu "u
//         u" u$$$$$$$$$$$$$$$$$$$$u "u
//       u" u$$$$$$$$$$$$$$$$$$$$$$$$u "u
//     u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
//   u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
// u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
// $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
// $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
// $ $$$" ... "$...  ...$" ... "$$$  ... "$$$ $
// $ $$$u `"$$$$$$$  $$$  $$$$$  $$  $$$  $$$ $
// $ $$$$$$uu "$$$$  $$$  $$$$$  $$  """ u$$$ $
// $ $$$""$$$  $$$$  $$$u "$$$" u$$  $$$$$$$$ $
// $ $$$$....,$$$$$..$$$$$....,$$$$..$$$$$$$$ $
// $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
// "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
//   "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
//     "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
//       "u "$$$$$$$$$$$$$$$$$$$$$$$$" u"
//         "u "$$$$$$$$$$$$$$$$$$$$" u"
//           "u """""""""""""""""" u"
//

import type {
  AutolockSettingsOption,
  Blockchain,
  EventEmitter,
  FEATURE_GATES_MAP,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  Preferences,
  PrivateKeyKeyringInit,
  XnftPreference,
} from "@coral-xyz/common";
import {
  BACKEND_EVENT,
  makeUrl,
  NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_COMMITMENT_UPDATED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_EXPLORER_UPDATED,
  NOTIFICATION_FEATURE_GATES_UPDATED,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_XNFT_PREFERENCE_UPDATED,
  TAB_APPS,
  TAB_BALANCES,
  TAB_BALANCES_SET,
  TAB_NFTS,
  TAB_RECENT_ACTIVITY,
  TAB_SWAP,
  TAB_TOKENS,
  TAB_XNFT,
} from "@coral-xyz/common";
import { NotificationsClient } from "@coral-xyz/secure-background/clients";
import { defaultPreferences } from "@coral-xyz/secure-background/legacyCommon";
import type {
  KeyringStore,
  User,
} from "@coral-xyz/secure-background/legacyExport";
import { secureStore } from "@coral-xyz/secure-background/legacyExport";
import type {
  KeyringStoreState,
  TransportBroadcaster,
} from "@coral-xyz/secure-background/types";
import { getBlockchainConfig } from "@coral-xyz/secure-clients";
import type { Commitment } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { validateMnemonic as _validateMnemonic } from "bip39";

import type { Config, PublicKeyData, PublicKeyType } from "../types";

import type { Nav } from "./legacy-store";
import * as legacyStore from "./legacy-store";

export function start(
  cfg: Config,
  events: EventEmitter,
  keyringStore: KeyringStore,
  notificationBroadcaster: TransportBroadcaster
) {
  return new Backend(cfg, events, keyringStore, notificationBroadcaster);
}

export class Backend {
  private cfg: Config;
  private keyringStore: KeyringStore;
  private events: EventEmitter;
  private notificationsClient: NotificationsClient;

  // TODO: remove once beta is over.
  private xnftWhitelist: Promise<Array<string>>;

  constructor(
    cfg: Config,
    events: EventEmitter,
    keyringStore: KeyringStore,
    notificationBroadcaster: TransportBroadcaster
  ) {
    this.cfg = cfg;
    this.keyringStore = keyringStore;
    this.events = events;
    this.notificationsClient = new NotificationsClient(notificationBroadcaster);

    // TODO: remove once beta is over.
    this.xnftWhitelist = new Promise(async (resolve, reject) => {
      try {
        const resp = await fetch(
          "https://api.app-store.xnfts.dev/api/curation/whitelist",
          { headers: { "X-Requested-With": "app.backpack.background" } }
        );
        const { whitelist } = await resp.json();
        resolve(whitelist);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Solana Provider.
  ///////////////////////////////////////////////////////////////////////////////

  // TODO: need to make the entire provider API blockchain agnostic
  //       and take in a `Blockchain` param.

  async disconnect(origin: string): Promise<string> {
    return await this.approvedOriginsDelete(origin);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Solana.
  ///////////////////////////////////////////////////////////////////////////////

  async connectionUrlRead(
    uuid: string,
    blockchain: Blockchain
  ): Promise<string> {
    const data = await secureStore.getWalletDataForUser(uuid);
    const bcData = data.blockchains[blockchain];
    const defaultPreferences =
      getBlockchainConfig(blockchain).PreferencesDefault;
    return (bcData.connectionUrl ?? defaultPreferences.connectionUrl) as string;
  }

  // Returns true if the url changed.
  public async connectionUrlUpdate(
    cluster: string,
    blockchain: Blockchain
  ): Promise<boolean> {
    const user = await secureStore.getActiveUser();
    const data = await secureStore.getWalletDataForUser(user.uuid);
    const publicKeys = await secureStore.getUserPublicKeys(user.uuid);

    // TODO: consolidate cluster and connectionUrl fields.
    // @ts-ignore
    if (data.blockchains[blockchain].connectionUrl === cluster) {
      return false;
    }

    const activeWallet =
      publicKeys?.platforms[publicKeys.activePlatform]?.activePublicKey;

    await secureStore.setWalletDataForUser(user.uuid, {
      ...data,
      blockchains: {
        ...data.blockchains,
        [blockchain]: {
          ...(data[blockchain] || {}),
          connectionUrl: cluster,
        },
      },
    });
    this.notificationsClient.userUpdated();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_CONNECTION_URL_UPDATED,
      data: {
        activeWallet,
        url: cluster,
        blockchain,
      },
    });

    return true;
  }

  public async explorerUpdate(
    explorer: string,
    blockchain: Blockchain
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    const uuid = user.uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    data.blockchains[blockchain as string] = {
      ...(data.blockchains[blockchain] || {}),
      explorer,
    };
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
    });
    this.notificationsClient.userUpdated();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_EXPLORER_UPDATED,
      data: {
        explorer,
        blockchain,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async commitmentRead(
    uuid: string,
    blockchain: Blockchain
  ): Promise<Commitment> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.blockchains &&
      data.blockchains[blockchain] &&
      data.blockchains[blockchain].commitment
      ? data.blockchains[blockchain].commitment!
      : "processed";
  }

  async commitmentUpdate(
    commitment: Commitment,
    blockchain: Blockchain
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    const uuid = user.uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      blockchains: {
        ...data.blockchains,
        [blockchain]: {
          ...data.blockchains[blockchain],
          commitment,
        },
      },
    });
    this.notificationsClient.userUpdated();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_COMMITMENT_UPDATED,
      data: {
        commitment,
        blockchain,
      },
    });
    return SUCCESS_RESPONSE;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Ethereum.
  ///////////////////////////////////////////////////////////////////////////////

  async ethereumChainIdRead(): Promise<string> {
    const user = await secureStore.getActiveUser();
    const uuid = user.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);

    return data.blockchains &&
      data.blockchains.ethereum &&
      data.blockchains.ethereum.chainId
      ? data.blockchains.ethereum.chainId
      : // Default to mainnet
        "0x1";
  }

  async ethereumChainIdUpdate(chainId: string): Promise<string> {
    const user = await secureStore.getActiveUser();
    const uuid = user.uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      blockchains: {
        ...data.blockchains,
        ethereum: {
          ...(data.blockchains.ethereum || {}),
          chainId,
        },
      },
    });
    this.notificationsClient.userUpdated();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
      data: {
        chainId,
      },
    });
    return SUCCESS_RESPONSE;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Keyring.
  ///////////////////////////////////////////////////////////////////////////////

  async keyringStoreCheckPassword(password: string): Promise<boolean> {
    return await this.keyringStore.checkPassword(password);
  }

  async keyringStoreState(): Promise<KeyringStoreState> {
    return await this.keyringStore.state();
  }

  // Returns all pubkeys available for signing.
  async keyringStoreReadAllPubkeys(): Promise<PublicKeyType> {
    const activeUser = await secureStore.getActiveUser();
    const keyringPublicKeys = await this.keyringStore.publicKeys();
    const userPublicKeys = await secureStore.getUserPublicKeys(activeUser.uuid);

    const namedPublicKeys = {};
    for (const [blockchain, blockchainKeyring] of Object.entries(
      keyringPublicKeys
    )) {
      namedPublicKeys[blockchain] = {};
      for (const [keyring, publicKeys] of Object.entries(blockchainKeyring)) {
        if (!namedPublicKeys[blockchain][keyring]) {
          namedPublicKeys[blockchain][keyring] = [];
        }
        for (const publicKey of publicKeys) {
          namedPublicKeys[blockchain][keyring].push({
            publicKey,
            ...(userPublicKeys?.platforms[blockchain as Blockchain]?.publicKeys[
              publicKey
            ] ?? {}),
          });
        }
      }
    }
    return namedPublicKeys;
  }

  public async activeWalletForBlockchain(
    blockchain: Blockchain
  ): Promise<string | undefined> {
    const user = await secureStore.getActiveUser();
    const publicKeys = await secureStore.getUserPublicKeys(user.uuid);
    return publicKeys?.platforms[blockchain]?.activePublicKey;
  }

  private async activeWallets(): Promise<Array<string>> {
    const user = await secureStore.getActiveUser();
    const publicKeys = await secureStore.getUserPublicKeys(user.uuid);
    return Object.values(publicKeys?.platforms ?? {}).map(
      (platform) => platform.activePublicKey
    );
  }

  async preferencesRead(uuid: string): Promise<Preferences> {
    //
    // First time onboarding this will throw an error, in which case
    // we return a default set of preferences.
    //
    try {
      return await secureStore.getWalletDataForUser(uuid);
    } catch (err) {
      return defaultPreferences();
    }
  }

  // Map of blockchain to the active public key for that blockchain.
  async blockchainActiveWallets() {
    const user = await secureStore.getActiveUser();
    const publicKeys = await secureStore.getUserPublicKeys(user.uuid);
    return Object.fromEntries(
      Object.entries(publicKeys?.platforms ?? {}).map(
        ([blockchain, publicKeys]) => [blockchain, publicKeys.activePublicKey]
      )
    );
  }

  async keyIsCold(blockchain: Blockchain, publicKey: string): Promise<boolean> {
    const user = await secureStore.getActiveUser();
    return !!(
      await secureStore.getUserPublicKey(user.uuid, blockchain, publicKey)
    )?.isCold;
  }

  async keyIsColdUpdate(
    blockchain: Blockchain,
    publicKey: string,
    isCold: boolean
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    await secureStore.setUserPublicKey(user.uuid, blockchain, publicKey, {
      isCold,
    });
    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  /**
   * Read the name associated with a public key in the local store.
   * @param publicKey - public key to read the name for
   */
  async keynameRead(
    publicKey: string,
    blockchain: Blockchain
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    return (
      (await secureStore.getUserPublicKey(user.uuid, blockchain, publicKey))
        ?.name ?? "New Wallet"
    );
  }

  /**
   * Update the name associated with a public key in the local store.
   * @param publicKey - public key to update the name for
   * @param newName - new name to associate with the public key
   */
  async keynameUpdate(
    publicKey: string,
    newName: string,
    blockchain: Blockchain
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    await secureStore.setUserPublicKey(user.uuid, blockchain, publicKey, {
      name: newName,
    });
    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  // Returns the active username.
  // We read this directly from storage so that we can use it even when the
  // keyring is locked.
  async userRead(): Promise<User> {
    const user = await secureStore.getActiveUser();
    return user;
  }

  async allUsersRead(): Promise<Array<User>> {
    const userData = await secureStore.getUserData();
    return userData.users;
  }

  async passwordUpdate(
    currentPassword: string,
    newPassword: string
  ): Promise<string> {
    await this.keyringStore.passwordUpdate(currentPassword, newPassword);
    return SUCCESS_RESPONSE;
  }

  async keyringExportSecretKey(
    password: string,
    pubkey: string
  ): Promise<string> {
    return this.keyringStore.exportSecretKey(password, pubkey);
  }

  async keyringExportMnemonic(password: string): Promise<string> {
    return this.keyringStore.exportMnemonic(password);
  }

  async keyringReset(): Promise<string> {
    const user = await secureStore.getActiveUser();
    await secureStore.setUserPublicKeys(user.uuid, null);
    await this.keyringStore.reset();
    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  async keyringHasMnemonic(): Promise<boolean> {
    return (await this.keyringStore.activeUserKeyring()).hasMnemonic();
  }

  async previewPubkeys(
    blockchain: Blockchain,
    mnemonic: string,
    derivationPaths: Array<string>
  ) {
    return this.keyringStore.previewPubkeys(
      blockchain,
      mnemonic,
      derivationPaths
    );
  }

  async toggleShowAllCollectibles() {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    const current = data.showAllCollectibles ?? false;

    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      showAllCollectibles: !current,
    });

    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  async updateHiddenTokensForBlockchain(
    blockchain: Blockchain,
    action: "add" | "remove",
    address: string
  ) {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);

    const current = data.hiddenTokenAddresses?.[blockchain] ?? [];

    let newAddressList: string[];
    if (action === "add") {
      newAddressList = [...current, address];
    } else if (action === "remove") {
      newAddressList = current.filter((a) => a !== address);
    } else {
      newAddressList = current;
    }

    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      hiddenTokenAddresses: {
        ...(data.hiddenTokenAddresses ?? ({} as Record<Blockchain, string[]>)),
        [blockchain]: newAddressList,
      },
    });

    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Preferences.
  ///////////////////////////////////////////////////////////////////////////////

  async darkModeRead(uuid: string): Promise<boolean> {
    return false;

    // const state = await this.keyringStoreState();
    // if (state === "needs-onboarding") {
    //   return DEFAULT_DARK_MODE;
    // }
    // const data = await secureStore.getWalletDataForUser(uuid);
    // return data.darkMode ?? DEFAULT_DARK_MODE;
  }

  async darkModeUpdate(darkMode: boolean): Promise<string> {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      darkMode,
    });
    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  async fullScreenUpdate(isLockAvatarFullScreen: boolean): Promise<string> {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      isLockAvatarFullScreen,
    });
    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  async developerModeRead(uuid: string): Promise<boolean> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.developerMode ?? false;
  }

  async developerModeUpdate(developerMode: boolean): Promise<string> {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid!;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      developerMode,
    });
    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  async aggregateWalletsUpdate(aggregateWallets: boolean): Promise<string> {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid!;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      aggregateWallets,
    });
    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  async isApprovedOrigin(origin: string): Promise<boolean> {
    try {
      const { uuid } = await this.userRead();

      const data = await secureStore.getWalletDataForUser(uuid);
      if (!data.approvedOrigins) {
        return false;
      }
      const found = data.approvedOrigins.find((o) => o === origin);
      return found !== undefined;
    } catch {
      return false;
    }
  }

  async approvedOriginsRead(uuid: string): Promise<Array<string>> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.approvedOrigins;
  }

  async approvedOriginsUpdate(approvedOrigins: Array<string>): Promise<string> {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      approvedOrigins,
    });

    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  async approvedOriginsDelete(origin: string): Promise<string> {
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const data = await secureStore.getWalletDataForUser(uuid!);
    const approvedOrigins = data.approvedOrigins.filter((o) => o !== origin);
    await secureStore.setWalletDataForUser(uuid!, {
      ...data,
      approvedOrigins,
    });
    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  async setFeatureGates(gates: FEATURE_GATES_MAP) {
    await legacyStore.setFeatureGates(gates);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_FEATURE_GATES_UPDATED,
      data: {
        gates,
      },
    });
  }

  async getFeatureGates() {
    return await legacyStore.getFeatureGates();
  }

  async setXnftPreferences(
    uuid: string,
    xnftId: string,
    preference: XnftPreference
  ) {
    const currentPreferences =
      (await legacyStore.getXnftPreferencesForUser(uuid)) || {};
    const updatedPreferences = {
      ...currentPreferences,
      [xnftId]: {
        ...(currentPreferences[xnftId] || {}),
        ...preference,
      },
    };
    await legacyStore.setXnftPreferencesForUser(uuid, updatedPreferences);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_XNFT_PREFERENCE_UPDATED,
      data: { updatedPreferences },
    });
  }

  async getXnftPreferences(uuid) {
    return await legacyStore.getXnftPreferencesForUser(uuid);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Navigation.
  ///////////////////////////////////////////////////////////////////////////////

  async navigationPush(
    url: string,
    tab?: string,
    pushAboveRoot?: boolean
  ): Promise<string> {
    let nav = await legacyStore.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }

    const targetTab = tab ?? nav.activeTab ?? "balances";

    // This is a temporary measure for the duration of the private beta in order
    // to control the xNFTs that can be opened from within Backpack AND
    // externally using the injected provider's `openXnft` function.
    //
    // The whitelist is controlled internally and exposed through the xNFT
    // library's worker API to check the address of the xNFT attempting to be
    // opened by the user.
    if (targetTab === TAB_XNFT) {
      const pk = url.split("/")[1];
      const cachedWhitelist = await this.xnftWhitelist;

      if (!cachedWhitelist.includes(pk)) {
        // Secondary lazy check to ensure there wasn't a whitelist update in-between cache updates
        const resp = await fetch(
          `https://api.app-store.xnfts.dev/api/curation/whitelist/check?address=${pk}`,
          { headers: { "X-Requested-With": "app.backpack.background" } }
        );
        const { whitelisted } = await resp.json();

        if (!whitelisted) {
          throw new Error("opening an xnft that is not whitelisted");
        }
      }
    } else {
      delete nav.data[TAB_XNFT];
    }

    nav.data[targetTab] = nav.data[targetTab] ?? { id: targetTab, urls: [] };

    const urls = nav.data[targetTab].urls;

    if (urls.length > 0 && urls[urls.length - 1] === url) {
      return SUCCESS_RESPONSE;
    }

    if (pushAboveRoot && nav.data[targetTab].urls[0]) {
      nav.data[targetTab].urls = [nav.data[targetTab].urls[0]];
    }

    nav.data[targetTab].urls.push(url);

    await legacyStore.setNav(nav);

    url = setSearchParam(url, "nav", "push");

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
      data: {
        url,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async navigationPop(tab?: string): Promise<string> {
    let nav = await legacyStore.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }
    const targetTab = tab ?? nav.activeTab ?? "balances";
    nav.data[targetTab] = nav.data[targetTab] ?? { id: targetTab, urls: [] };
    nav.data[targetTab].urls.pop();
    await legacyStore.setNav(nav);

    const urls =
      nav.data[targetTab].urls.length > 0
        ? nav.data[targetTab].urls
        : nav.data[nav.activeTab].urls;
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

  async navigationToDefault(): Promise<string> {
    await legacyStore.setNav(defaultNav);
    return SUCCESS_RESPONSE;
  }

  async navigationToRoot(): Promise<string> {
    let nav = await legacyStore.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }

    delete nav.data[TAB_XNFT];

    const urls = nav.data[nav.activeTab].urls;
    if (urls.length <= 1) {
      return SUCCESS_RESPONSE;
    }

    let url = urls[0];
    nav.data[nav.activeTab].urls = [url];
    await legacyStore.setNav(nav);

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
    let nav = await legacyStore.getNav();
    if (!nav) {
      await legacyStore.setNav(defaultNav);
      nav = defaultNav;
    }
    nav = nav as Nav;

    if ([TAB_APPS, TAB_SWAP].includes(nav.activeTab)) {
      delete nav.data[TAB_SWAP];
      delete nav.data[TAB_APPS];
      nav.activeTab = TAB_BALANCES;
      await legacyStore.setNav(nav);
    }

    //
    // Migrate balances tab if needed.
    //
    // This only works if this method is called on app load.
    //
    if (!nav.data["balances"].ref) {
      nav.data["balances"] = {
        id: "balances",
        ref: "tokens",
        urls: [],
      };
      nav.data["tokens"] = {
        id: "tokens",
        urls: [makeUrl("tokens", { title: "Tokens", props: {} })],
      };
      await legacyStore.setNav(nav);
    }

    // @ts-ignore
    return nav;
  }

  async navReadUrl(): Promise<string> {
    const nav = await this.navRead();

    let tab = nav.data[nav.activeTab];
    if (tab.ref) {
      tab = nav.data[tab.ref];
    }
    let urls = tab.urls;
    if (nav.data[TAB_XNFT]?.urls.length > 0) {
      urls = nav.data[TAB_XNFT].urls;
    }
    return urls[urls.length - 1];
  }

  async navigationActiveTabUpdate(activeTab: string): Promise<string> {
    const currNav = await legacyStore.getNav();
    if (!currNav) {
      throw new Error("invariant violation");
    }

    if (activeTab !== TAB_XNFT) {
      delete currNav.data[TAB_XNFT];
    }

    // Newly introduced messages tab needs to be added to the
    // store for backward compatability
    if (activeTab === "messages" && !currNav.data[activeTab]) {
      currNav.data[activeTab] = {
        id: "messages",
        urls: [makeUrl("messages", { title: "Messages", props: {} })],
      };
    }

    // The "balances" tab is just a ref to the other internal tabs.
    activeTab =
      activeTab === "balances" ? currNav.data[activeTab].ref : activeTab;

    //
    // Sync the "balances" ref field
    //
    if (TAB_BALANCES_SET.has(activeTab)) {
      currNav.data["balances"].ref = activeTab;
    }

    const nav = {
      ...currNav,
      activeTab,
    };

    await legacyStore.setNav(nav);

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

  async navigationCurrentUrlUpdate(
    url: string,
    activeTab?: string
  ): Promise<string> {
    // Get the tab nav.
    const currNav = await legacyStore.getNav();
    if (!currNav) {
      throw new Error("invariant violation");
    }

    if (activeTab !== TAB_XNFT) {
      delete currNav.data[TAB_XNFT];
    }

    // Update the active tab's nav stack.
    activeTab = activeTab ?? currNav.activeTab;

    const navData = currNav.data[activeTab!];
    if (!navData) {
      // We exit gracefully so that we don't crash the app.
      console.error(`navData not found for tab ${activeTab}`);
      return SUCCESS_RESPONSE;
    }
    navData.urls[navData.urls.length - 1] = url;
    currNav.data[activeTab!] = navData;

    //
    // Sync the "balances" ref field
    //
    if (TAB_BALANCES_SET.has(activeTab)) {
      currNav.data["balances"].ref = activeTab;
    }

    // Save the change.
    await legacyStore.setNav(currNav);

    // Only navigate if the user hasn't already moved away from this tab
    // or if the user didn't explicitly send an activeTab
    if (!activeTab || activeTab === currNav.activeTab) {
      // Notify listeners.
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
        data: {
          url,
          nav: "tab",
        },
      });
    }

    return SUCCESS_RESPONSE;
  }
}

export const SUCCESS_RESPONSE = "success";
const defaultNav = makeDefaultNav();

function makeDefaultNav() {
  const defaultNav: any = {
    activeTab: TAB_TOKENS,
    data: {},
  };
  [
    [TAB_BALANCES, "Balances"],
    [TAB_NFTS, "Nfts"],
    // [TAB_SWAP, "Swap"],
    // [TAB_APPS, "Apps"],
    [TAB_RECENT_ACTIVITY, "Recent Activity"],
    [TAB_TOKENS, "Tokens"],
  ].forEach(([tabName, tabTitle]) => {
    defaultNav.data[tabName] = {
      id: tabName,
      urls: [makeUrl(tabName, { title: tabTitle, props: {} })],
      ref: tabName === "balances" ? "tokens" : undefined,
    };
  });
  return defaultNav;
}

function setSearchParam(url: string, key: string, value: string): string {
  const [path, search] = url.split("?");
  const searchParams = new URLSearchParams(search);
  searchParams.delete(key);
  searchParams.append(key, value);
  return `${path}?${searchParams.toString()}`;
}
