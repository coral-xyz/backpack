import type {
  AutolockSettingsOption,
  EventEmitter,
  FEATURE_GATES_MAP,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  Preferences,
  PrivateKeyKeyringInit,
  WalletDescriptor,
  XnftPreference,
} from "@coral-xyz/common";
import {
  BACKEND_EVENT,
  Blockchain,
  IS_MOBILE,
  makeUrl,
  NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_COMMITMENT_UPDATED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_EXPLORER_UPDATED,
  NOTIFICATION_FEATURE_GATES_UPDATED,
  NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
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
import {
  defaultPreferences,
  getAccountRecoveryPaths,
} from "@coral-xyz/secure-background/legacyCommon";
import type {
  BlockchainKeyring,
  KeyringStore,
  User,
} from "@coral-xyz/secure-background/legacyExport";
import {
  keyringForBlockchain,
  secureStore,
} from "@coral-xyz/secure-background/legacyExport";
import type { TransportBroadcaster } from "@coral-xyz/secure-background/types";
import { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { getBlockchainConfig } from "@coral-xyz/secure-clients";
import { deserializeTransaction } from "@coral-xyz/secure-clients/legacyCommon";
import type {
  Commitment,
  SendOptions,
  SimulateTransactionConfig,
} from "@solana/web3.js";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { validateMnemonic as _validateMnemonic } from "bip39";
import { ethers } from "ethers";

import type { Config, PublicKeyData, PublicKeyType } from "../types";

import type { EthereumConnectionBackend } from "./ethereum-connection";
import type { Nav } from "./legacy-store";
import * as legacyStore from "./legacy-store";
import type { SolanaConnectionBackend } from "./solana-connection";

const { base58: bs58 } = ethers.utils;

export function start(
  cfg: Config,
  events: EventEmitter,
  keyringStore: KeyringStore,
  notificationBroadcaster: TransportBroadcaster,
  solanaB: SolanaConnectionBackend,
  ethereumB: EthereumConnectionBackend
) {
  return new Backend(
    cfg,
    events,
    keyringStore,
    notificationBroadcaster,
    solanaB,
    ethereumB
  );
}

export class Backend {
  private cfg: Config;
  private keyringStore: KeyringStore;
  private solanaConnectionBackend: SolanaConnectionBackend;
  private ethereumConnectionBackend: EthereumConnectionBackend;
  private events: EventEmitter;
  private notificationsClient: NotificationsClient;

  // TODO: remove once beta is over.
  private xnftWhitelist: Promise<Array<string>>;

  constructor(
    cfg: Config,
    events: EventEmitter,
    keyringStore: KeyringStore,
    notificationBroadcaster: TransportBroadcaster,
    solanaB: SolanaConnectionBackend,
    ethereumB: EthereumConnectionBackend
  ) {
    this.cfg = cfg;
    this.keyringStore = keyringStore;
    this.solanaConnectionBackend = solanaB;
    this.ethereumConnectionBackend = ethereumB;
    this.events = events;
    this.notificationsClient = new NotificationsClient(notificationBroadcaster);

    // TODO: remove once beta is over.
    this.xnftWhitelist = new Promise(async (resolve, reject) => {
      try {
        const resp = await fetch(
          "https://api.app-store.xnfts.dev/api/curation/whitelist"
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

  async solanaSignAndSendTx(
    txStr: string,
    walletAddress: string,
    options?: SendOptions
  ): Promise<string> {
    // Sign the transaction.
    const signature = await this.solanaSignTransaction(txStr, walletAddress);
    const pubkey = new PublicKey(walletAddress);
    const tx = deserializeTransaction(txStr);

    tx.addSignature(pubkey, Buffer.from(bs58.decode(signature)));

    // Send it to the network.
    const uuid = (await this.keyringStore.activeUserKeyring()).uuid;
    const commitment = await this.commitmentRead(uuid!, Blockchain.SOLANA);
    return await this.solanaConnectionBackend.sendRawTransaction(
      tx.serialize(),
      options ?? {
        skipPreflight: false,
        preflightCommitment: commitment,
      }
    );
  }

  async solanaSignAllTransactions(
    txs: Array<string>,
    walletAddress: string
  ): Promise<Array<string>> {
    const signed: Array<string> = [];
    for (let k = 0; k < txs.length; k += 1) {
      signed.push(await this.solanaSignTransaction(txs[k], walletAddress));
    }
    return signed;
  }

  // Returns the signature.
  async solanaSignTransaction(
    txStr: string,
    walletAddress: string
  ): Promise<string> {
    let tx = deserializeTransaction(txStr);
    const message = tx.message.serialize();
    const txMessage = bs58.encode(message);
    const blockchainKeyring = (
      await this.keyringStore.activeUserKeyring()
    ).keyringForBlockchain(Blockchain.SOLANA);
    const signature = await blockchainKeyring.signTransaction(
      txMessage,
      walletAddress
    );
    return signature;
  }

  async solanaSignMessage(msg: string, walletAddress: string): Promise<string> {
    const blockchainKeyring = (
      await this.keyringStore.activeUserKeyring()
    ).keyringForBlockchain(Blockchain.SOLANA);
    return await blockchainKeyring.signMessage(msg, walletAddress);
  }

  async solanaSimulate(txStr: string, addresses: Array<string>): Promise<any> {
    const tx = deserializeTransaction(txStr);
    const signersOrConf =
      "message" in tx
        ? ({
            accounts: {
              encoding: "base64",
              addresses,
            },
          } as SimulateTransactionConfig)
        : undefined;
    return await this.solanaConnectionBackend.simulateTransaction(
      tx,
      signersOrConf,
      addresses.length > 0 ? addresses.map((k) => new PublicKey(k)) : undefined
    );
  }

  async disconnect(origin: string): Promise<string> {
    return await this.approvedOriginsDelete(origin);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Solana.
  ///////////////////////////////////////////////////////////////////////////////

  async solanaRecentBlockhash(commitment?: Commitment): Promise<string> {
    const { blockhash } = await this.solanaConnectionBackend.getLatestBlockhash(
      commitment
    );
    return blockhash;
  }

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
  // Ethereum provider.
  ///////////////////////////////////////////////////////////////////////////////

  async ethereumSignTransaction(
    serializedTx: string,
    walletAddress: string
  ): Promise<string> {
    const blockchainKeyring = (
      await this.keyringStore.activeUserKeyring()
    ).keyringForBlockchain(Blockchain.ETHEREUM);
    return await blockchainKeyring.signTransaction(serializedTx, walletAddress);
  }

  async ethereumSignAndSendTransaction(
    serializedTx: string,
    walletAddress: string
  ): Promise<string> {
    const signedTx = await this.ethereumSignTransaction(
      serializedTx,
      walletAddress
    );
    return (await this.ethereumConnectionBackend.sendTransaction(signedTx))
      .hash;
  }

  async ethereumSignMessage(msg: string, walletAddress: string) {
    const blockchainKeyring = (
      await this.keyringStore.activeUserKeyring()
    ).keyringForBlockchain(Blockchain.ETHEREUM);
    return await blockchainKeyring.signMessage(msg, walletAddress);
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
  // Misc
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Sign a message using a given public key. If the keyring store is not unlocked
   * keyring initialisation parameters must be provided that will initialise a
   * keyring to contain the given public key.
   *
   * This is used during onboarding to sign messages prior to the store being
   * initialised.
   */
  async signMessageForPublicKey(
    blockchain: Blockchain,
    publicKey: string,
    msg: string,
    keyringInit?:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit
  ) {
    if (
      !keyringInit &&
      (await this.keyringStoreState()) !== KeyringStoreState.Unlocked
    ) {
      throw new Error(
        "provide a keyring init or unlock keyring to sign message"
      );
    }

    let blockchainKeyring: BlockchainKeyring;
    // If keyring init parameters were provided then init the keyring
    if (keyringInit) {
      // Create an empty keyring to init
      blockchainKeyring = keyringForBlockchain(blockchain, secureStore);
      if ("mnemonic" in keyringInit) {
        // If mnemonic wasn't actually passed retrieve it from the store. This
        // is to avoid having to pass the mnemonic to the client to make this
        // call
        if (keyringInit.mnemonic === true) {
          keyringInit.mnemonic = (
            await this.keyringStore.activeUserKeyring()
          ).exportMnemonic();
        }
      }
      await blockchainKeyring.init(keyringInit);
    } else {
      // We are unlocked, just use the keyring
      blockchainKeyring = (
        await this.keyringStore.activeUserKeyring()
      ).keyringForBlockchain(blockchain);
    }

    if (!blockchainKeyring.hasPublicKey(publicKey)) {
      throw new Error("could not find public key for signing");
    }

    if (blockchain === Blockchain.SOLANA) {
      // Setup a dummy transaction using the memo program for signing. This is
      // necessary because the Solana Ledger app does not support signMessage.
      const tx = new Transaction();
      tx.add(
        new TransactionInstruction({
          programId: new PublicKey(publicKey),
          keys: [],
          data: Buffer.from(bs58.decode(msg)),
        })
      );
      tx.feePayer = new PublicKey(publicKey);
      // Not actually needed as it's not transmitted to the network
      tx.recentBlockhash = tx.feePayer.toString();
      return await blockchainKeyring.signTransaction(
        bs58.encode(tx.serializeMessage()),
        publicKey
      );
    }

    return await blockchainKeyring.signMessage(msg, publicKey);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Keyring.
  ///////////////////////////////////////////////////////////////////////////////

  // Creates a brand new keyring store. Should be run once on initializtion.
  async keyringStoreCreate(
    username: string | undefined | null,
    password: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string
  ): Promise<string> {
    const userCount = this.keyringStore.userCount();
    username = username ?? `Account ${userCount + 1}`;

    await this.keyringStore.init(username, password, uuid, keyringInit);

    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  async usernameAccountCreate(
    username: string | undefined | null,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string
  ): Promise<string> {
    const userCount = this.keyringStore.userCount();
    username = username ?? `Account ${userCount + 1}`;
    await this.keyringStore.usernameKeyringCreate(username, uuid, keyringInit);
    // const walletData = await this.keyringStoreReadAllPubkeyData();
    // const preferences = await this.preferencesRead(uuid);
    // const xnftPreferences = await this.getXnftPreferences(uuid);

    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  private async activeUserUpdate(uuid: string): Promise<string> {
    // Change active user account.
    const { username } = await this.keyringStore.activeUserUpdate(uuid);

    // Get data to push back to the UI.
    const walletData = await this.keyringStoreReadAllPubkeyData();

    // Get preferences to push back to the UI.
    const preferences = await this.preferencesRead(uuid);
    const xnftPreferences = await this.getXnftPreferences(uuid);
    const blockchainKeyrings = await this.blockchainKeyringsRead();

    // getNav doesn't need to be called for mobile since we have our own system
    if (!IS_MOBILE) {
      const navData = await legacyStore.getNav();
      const activeTab = navData?.activeTab ?? TAB_TOKENS;
      if (activeTab) {
        await legacyStore.setNav({
          ...defaultNav,
          activeTab,
        });
      }

      const url = defaultNav.data[activeTab].urls[0];
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
        data: {
          url,
        },
      });
    }

    // Push it.
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
      data: {
        user: {
          uuid,
          username,
        },
        walletData,
        preferences,
        xnftPreferences,
        blockchainKeyrings,
      },
    });
    await this.notificationsClient.userUpdated();

    // Done.
    return SUCCESS_RESPONSE;
  }

  async keyringStoreCheckPassword(password: string): Promise<boolean> {
    return await this.keyringStore.checkPassword(password);
  }

  async keyringStoreUnlock(password: string, uuid: string): Promise<string> {
    //
    // Note: we package the userInfo into an object so that it can be mutated
    //       by downstream functions. This is required, e.g., for migrating
    //       when a uuid doesn't yet exist on the client.
    //
    const userInfo = { password, uuid };
    await this.keyringStore.tryUnlock(userInfo);
    const activeUser = (await secureStore.getUserData()).activeUser;

    const blockchainActiveWallets = await this.blockchainActiveWallets();
    const ethereumConnectionUrl = await this.connectionUrlRead(
      userInfo.uuid,
      Blockchain.ETHEREUM
    );
    const ethereumChainId = await this.ethereumChainIdRead();
    const solanaConnectionUrl = await this.connectionUrlRead(
      userInfo.uuid,
      Blockchain.SOLANA
    );
    const solanaCommitment = await this.commitmentRead(
      userInfo.uuid,
      Blockchain.SOLANA
    );
    // TODO: make all this blockchain agnostic.
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
      data: {
        activeUser,
        blockchainActiveWallets,
        ethereumConnectionUrl,
        ethereumChainId,
        solanaConnectionUrl,
        solanaCommitment,
      },
    });
    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  keyringStoreLock() {
    this.keyringStore.lock();
    return SUCCESS_RESPONSE;
  }

  async keyringStoreState(): Promise<KeyringStoreState> {
    return await this.keyringStore.state();
  }

  keyringStoreKeepAlive(): string {
    this.keyringStore.keepAlive();
    return SUCCESS_RESPONSE;
  }

  private async keyringStoreReadAllPubkeyData(): Promise<PublicKeyData> {
    const activePublicKeys = await this.activeWallets();
    const publicKeys = await this.keyringStoreReadAllPubkeys();
    // const activeBlockchain = (await this.keyringStore.activeUserKeyring())
    //   .activeBlockchain!;
    return {
      activeBlockchain: Blockchain.SOLANA,
      activePublicKeys,
      publicKeys,
    };
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

  async activeWalletUpdate(
    newActivePublicKey: string,
    blockchain: Blockchain
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    const userPublicKeys = await secureStore.getUserPublicKeys(user.uuid);

    const oldBlockchain = userPublicKeys?.activePlatform;
    const oldActivePublicKey =
      oldBlockchain &&
      userPublicKeys?.platforms[oldBlockchain]?.activePublicKey;

    await secureStore.setUserActivePublicKey(
      user.uuid,
      blockchain,
      newActivePublicKey
    );

    // if (newActivePublicKey !== oldActivePublicKey || blockchain !== oldBlockchain) {
    await this.notificationsClient.userUpdated();
    // }

    if (newActivePublicKey !== oldActivePublicKey) {
      // Public key has changed, emit an event
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_ACTIVE_WALLET_UPDATED,
        data: {
          activeWallet: newActivePublicKey,
          activeWallets: await this.activeWallets(),
          blockchain,
        },
      });
    }

    if (blockchain !== oldBlockchain) {
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED,
        data: {
          oldBlockchain,
          newBlockchain: blockchain,
        },
      });
    }

    return SUCCESS_RESPONSE;
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

  async keyringReadNextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): Promise<{ derivationPath: any; offset: number }> {
    return this.keyringStore.nextDerivationPath(blockchain, keyring);
  }

  /**
   * Add a new wallet to the keyring using the next derived wallet for the mnemonic.
   * @param blockchain - Blockchain to add the wallet for
   */
  async keyringImportWallet(
    signedWalletDescriptor: WalletDescriptor
  ): Promise<string> {
    const { blockchain } = signedWalletDescriptor;

    const { publicKey, name } = await this.keyringStore.addDerivationPath(
      blockchain,
      signedWalletDescriptor.derivationPath
    );

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

    await this.notificationsClient.userUpdated();

    // Return the newly added public key
    return publicKey.toString();
  }

  /**
   * Add a new wallet to the keyring using the next derived wallet for the mnemonic.
   * @param blockchain - Blockchain to add the wallet for
   */
  async keyringDeriveWallet(
    blockchain: Blockchain,
    retries = 0
  ): Promise<string> {
    const { publicKey, name } = await this.keyringStore.deriveNextKey(
      blockchain
    );

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

    await this.notificationsClient.userUpdated();

    // Return the newly added public key
    return publicKey.toString();
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

  /**
   * Remove a wallet from the keyring and delete the public key record on the
   * server. If the public key was the last public key on the keyring then also
   * remove the entire blockchain keyring.
   * @param blockchain - Blockchain for the public key
   * @param publicKey - Public key to remove
   */
  async keyringKeyDelete(
    blockchain: Blockchain,
    publicKey: string
  ): Promise<string> {
    const user = await secureStore.getActiveUser();
    const publicKeys = await secureStore.getUserPublicKeys(user.uuid);

    const totalPublicKeys: number = Object.values(publicKeys?.platforms ?? {})
      .map((platform) => Object.keys(platform.publicKeys).length)
      .reduce((count, pCount) => count + pCount, 0);

    // If this is last PublicKey from the user, then logout.
    if (totalPublicKeys <= 1) {
      return await this.userAccountLogout(user.uuid);
    }

    await this.keyringStore.keyDelete(blockchain, publicKey);

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

  async importSecretKey(
    blockchain: Blockchain,
    secretKey: string,
    name: string
  ): Promise<string> {
    const [publicKey, _name] = await this.keyringStore.importSecretKey(
      blockchain,
      secretKey,
      name
    );

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);
    await this.notificationsClient.userUpdated();

    return publicKey;
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

  async keyringAutoLockSettingsRead(uuid: string) {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.autoLockSettings;
  }

  async keyringAutoLockSettingsUpdate(
    seconds?: number,
    option?: AutolockSettingsOption
  ): Promise<string> {
    await this.keyringStore.autoLockSettingsUpdate(seconds, option);
    await this.notificationsClient.userUpdated();

    return SUCCESS_RESPONSE;
  }

  async keyringReset(): Promise<string> {
    const user = await secureStore.getActiveUser();
    await secureStore.setUserPublicKeys(user.uuid, null);
    await this.keyringStore.reset();
    await this.notificationsClient.userUpdated();
    return SUCCESS_RESPONSE;
  }

  async ledgerImport(signedWalletDescriptor: WalletDescriptor) {
    const { ...walletDescriptor } = signedWalletDescriptor;
    const { blockchain, publicKey } = walletDescriptor;
    await this.keyringStore.ledgerImport(walletDescriptor);

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);
    return SUCCESS_RESPONSE;
  }

  validateMnemonic(mnemonic: string): boolean {
    return _validateMnemonic(mnemonic);
  }

  async mnemonicCreate(strength: number): Promise<string> {
    return this.keyringStore.createMnemonic(strength);
  }

  async keyringHasMnemonic(): Promise<boolean> {
    return (await this.keyringStore.activeUserKeyring()).hasMnemonic();
  }

  async keyringSetMnemonic(mnemonic: string) {
    return this.keyringStore.setMnemonic(mnemonic);
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
  // User account.
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Delete a user group.
   */
  async userAccountLogout(uuid: string): Promise<string> {
    //
    // If we're logging out the last user, reset the entire app.
    //
    const data = await secureStore.getUserData();
    if (data.users.length === 1) {
      return this.keyringReset();
    }

    //
    // If we have more users available, just remove the user.
    //
    await this.keyringStore.removeUser(uuid);
    await this.notificationsClient.userUpdated();

    // //
    // // If the user changed, notify the UI.
    // //
    // if (isNewActiveUser) {
    //   const user = await this.userRead();
    //   const walletData = await this.keyringStoreReadAllPubkeyData();
    //   const preferences = await this.preferencesRead(uuid);
    //   const xnftPreferences = await this.getXnftPreferences(uuid);
    //   const blockchainKeyrings = await this.blockchainKeyringsRead();

    //   this.events.emit(BACKEND_EVENT, {
    //     name: NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
    //     data: {
    //       user,
    //       walletData,
    //       preferences,
    //       xnftPreferences,
    //       blockchainKeyrings,
    //     },
    //   });
    // } else {
    //   //
    //   // Notify the UI about the removal.
    //   //
    //   this.events.emit(BACKEND_EVENT, {
    //     name: NOTIFICATION_KEYRING_STORE_REMOVED_USER,
    //   });
    // }

    //
    // Done.
    //
    return SUCCESS_RESPONSE;
  }

  /**
   * Find a `WalletDescriptor` that can be used to create a new account.
   * This requires that the sub wallets on the account index are not used by a
   * existing user account. This is checked by querying the Backpack API.
   *
   * This only works for mnemonics or a keyring store unlocked with a mnemonic
   * because the background service worker can't use a Ledger.
   */
  async findWalletDescriptor(
    blockchain: Blockchain,
    accountIndex = 0,
    mnemonic?: string
  ): Promise<WalletDescriptor> {
    // If mnemonic is not passed as an argument, use the keyring store stored mnemonic.
    // Wallet must be unlocked.
    if (!mnemonic)
      mnemonic = (await this.keyringStore.activeUserKeyring()).exportMnemonic();
    const config = getBlockchainConfig(blockchain);
    const recoveryPaths = getAccountRecoveryPaths(
      config.bip44CoinType,
      accountIndex
    );
    const publicKeys = await this.previewPubkeys(
      blockchain,
      mnemonic!,
      recoveryPaths
    );

    const users = []; // TODO(delete): probably remove this entire method.
    if (users.length === 0) {
      // No users for any of the passed public keys, good to go
      // Take the root for the public key path
      const publicKey = publicKeys[0];
      const derivationPath = recoveryPaths[0];
      return {
        blockchain,
        derivationPath,
        publicKey,
      };
    } else {
      // Iterate on account index
      return this.findWalletDescriptor(blockchain, accountIndex + 1, mnemonic!);
    }
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

  ///////////////////////////////////////////////////////////////////////////////
  // Blockchains
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Add a new blockchain keyring to the keyring store (i.e. initialize it).
   */
  async blockchainKeyringsAdd(
    keyringInit: MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit
  ): Promise<string> {
    const { blockchain, publicKey } =
      "signedWalletDescriptors" in keyringInit
        ? keyringInit.signedWalletDescriptors[0]
        : keyringInit;

    await this.keyringStore.blockchainKeyringAdd(blockchain, keyringInit);

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

    // const publicKeyData = await this.keyringStoreReadAllPubkeyData();
    await this.notificationsClient.userUpdated();

    return publicKey;
  }

  /**
   * Return all blockchains that have initialised keyrings, even if they are not
   * enabled.
   */
  async blockchainKeyringsRead(): Promise<Array<Blockchain>> {
    return (await this.keyringStore.activeUserKeyring()).blockchainKeyrings();
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
          `https://api.app-store.xnfts.dev/api/curation/whitelist/check?address=${pk}`
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
