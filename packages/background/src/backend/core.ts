import type {
  AutolockSettingsOption,
  EventEmitter,
  FEATURE_GATES_MAP,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  Preferences,
  PrivateKeyKeyringInit,
  ServerPublicKey,
  SignedWalletDescriptor,
  WalletDescriptor,
  XnftPreference,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKEND_EVENT,
  Blockchain,
  DEFAULT_DARK_MODE,
  defaultPreferences,
  deserializeTransaction,
  EthereumConnectionUrl,
  EthereumExplorer,
  getAccountRecoveryPaths,
  getAddMessage,
  getRecoveryPaths,
  IS_MOBILE,
  makeUrl,
  NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED,
  NOTIFICATION_AGGREGATE_WALLETS_UPDATED,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_AUTO_LOCK_SETTINGS_UPDATED,
  NOTIFICATION_BLOCKCHAIN_KEYRING_CREATED,
  NOTIFICATION_BLOCKCHAIN_KEYRING_DELETED,
  NOTIFICATION_DARK_MODE_UPDATED,
  NOTIFICATION_DEVELOPER_MODE_UPDATED,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_EXPLORER_UPDATED,
  NOTIFICATION_FEATURE_GATES_UPDATED,
  NOTIFICATION_KEY_IS_COLD_UPDATE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_IMPORTED_WALLET,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYRING_SET_MNEMONIC,
  NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_REMOVED_USER,
  NOTIFICATION_KEYRING_STORE_RESET,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_COMMITMENT_UPDATED,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  NOTIFICATION_SOLANA_EXPLORER_UPDATED,
  NOTIFICATION_USER_ACCOUNT_AUTHENTICATED,
  NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_CREATED,
  NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_DELETED,
  NOTIFICATION_USER_ACCOUNT_PUBLIC_KEYS_UPDATED,
  NOTIFICATION_XNFT_PREFERENCE_UPDATED,
  SolanaCluster,
  SolanaExplorer,
  TAB_BALANCES_SET,
  TAB_TOKENS,
  TAB_XNFT,
} from "@coral-xyz/common";
import { makeDefaultNav } from "@coral-xyz/recoil";
import type {
  BlockchainKeyring,
  KeyringStore,
  User,
} from "@coral-xyz/secure-background/legacyExport";
import {
  keyringForBlockchain,
  secureStore,
} from "@coral-xyz/secure-background/legacyExport";
import { KeyringStoreState } from "@coral-xyz/secure-background/types";
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

import type { PublicKeyData, PublicKeyType } from "../types";

import type { EthereumConnectionBackend } from "./ethereum-connection";
import type { Nav } from "./legacy-store";
import * as legacyStore from "./legacy-store";
import type { SolanaConnectionBackend } from "./solana-connection";

const { base58: bs58 } = ethers.utils;

export function start(
  events: EventEmitter,
  keyringStore: KeyringStore,
  solanaB: SolanaConnectionBackend,
  ethereumB: EthereumConnectionBackend
) {
  return new Backend(events, keyringStore, solanaB, ethereumB);
}

export class Backend {
  private keyringStore: KeyringStore;
  private solanaConnectionBackend: SolanaConnectionBackend;
  private ethereumConnectionBackend: EthereumConnectionBackend;
  private events: EventEmitter;

  // TODO: remove once beta is over.
  private xnftWhitelist: Promise<Array<string>>;

  constructor(
    events: EventEmitter,
    keyringStore: KeyringStore,
    solanaB: SolanaConnectionBackend,
    ethereumB: EthereumConnectionBackend
  ) {
    this.keyringStore = keyringStore;
    this.solanaConnectionBackend = solanaB;
    this.ethereumConnectionBackend = ethereumB;
    this.events = events;

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
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const commitment = await this.solanaCommitmentRead(uuid);
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
    const blockchainKeyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.SOLANA
      );
    const signature = await blockchainKeyring.signTransaction(
      txMessage,
      walletAddress
    );
    return signature;
  }

  async solanaSignMessage(msg: string, walletAddress: string): Promise<string> {
    const blockchainKeyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.SOLANA
      );
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

  async solanaConnectionUrlRead(uuid: string): Promise<string> {
    let data = await secureStore.getWalletDataForUser(uuid);

    // migrate the old default RPC value, this can be removed in future
    const OLD_DEFAULT = "https://solana-rpc-nodes.projectserum.com";
    if (
      // if the current default RPC does not match the old one
      SolanaCluster.DEFAULT !== OLD_DEFAULT &&
      // and the user's RPC URL is that old default value
      data.solana?.cluster === OLD_DEFAULT
    ) {
      // set the user's RPC URL to the new default value
      data = {
        ...data,
        solana: {
          ...data.solana,
          cluster: SolanaCluster.DEFAULT,
        },
      };
      await secureStore.setWalletDataForUser(uuid, data);
    }

    return (data.solana && data.solana.cluster) ?? SolanaCluster.DEFAULT;
  }

  // Returns true if the url changed.
  async solanaConnectionUrlUpdate(cluster: string): Promise<boolean> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);

    if (data.solana.cluster === cluster) {
      return false;
    }

    let keyring: BlockchainKeyring | null;
    try {
      keyring = this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.SOLANA
      );
    } catch {
      // Blockchain may be disabled
      keyring = null;
    }
    const activeWallet = keyring ? keyring.getActiveWallet() : null;

    await secureStore.setWalletDataForUser(uuid, {
      ...data,
      solana: {
        ...data.solana,
        cluster,
      },
    });

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
      data: {
        activeWallet,
        url: cluster,
      },
    });

    return true;
  }

  async solanaExplorerRead(uuid: string): Promise<string> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.solana && data.solana.explorer
      ? data.solana.explorer
      : SolanaExplorer.DEFAULT;
  }

  async solanaExplorerUpdate(explorer: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
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

  async solanaCommitmentRead(uuid: string): Promise<Commitment> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.solana && data.solana.commitment
      ? data.solana.commitment
      : "processed";
  }

  async solanaCommitmentUpdate(commitment: Commitment): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
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
  // Ethereum provider.
  ///////////////////////////////////////////////////////////////////////////////

  async ethereumSignTransaction(
    serializedTx: string,
    walletAddress: string
  ): Promise<string> {
    const blockchainKeyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.ETHEREUM
      );
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
    const blockchainKeyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.ETHEREUM
      );
    return await blockchainKeyring.signMessage(msg, walletAddress);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Ethereum.
  ///////////////////////////////////////////////////////////////////////////////

  async ethereumExplorerRead(uuid: string): Promise<string> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.ethereum && data.ethereum.explorer
      ? data.ethereum.explorer
      : EthereumExplorer.DEFAULT;
  }

  async ethereumExplorerUpdate(explorer: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
      ...data,
      ethereum: {
        ...(data.ethereum || {}),
        explorer,
      },
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ETHEREUM_EXPLORER_UPDATED,
      data: {
        explorer,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async ethereumConnectionUrlRead(uuid: string): Promise<string> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.ethereum && data.ethereum.connectionUrl
      ? data.ethereum.connectionUrl
      : EthereumConnectionUrl.DEFAULT;
  }

  async ethereumConnectionUrlUpdate(connectionUrl: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);

    await secureStore.setWalletDataForUser(uuid, {
      ...data,
      ethereum: {
        ...(data.ethereum || {}),
        connectionUrl,
      },
    });

    let keyring: BlockchainKeyring | null;
    try {
      keyring = this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.ETHEREUM
      );
    } catch {
      // Blockchain may be disabled
      keyring = null;
    }
    const activeWallet = keyring ? keyring.getActiveWallet() : null;

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
      data: {
        activeWallet,
        connectionUrl,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async ethereumChainIdRead(): Promise<string> {
    const data = await secureStore.getWalletDataForUser(
      this.keyringStore.activeUserKeyring.uuid
    );
    return data.ethereum && data.ethereum.chainId
      ? data.ethereum.chainId
      : // Default to mainnet
        "0x1";
  }

  async ethereumChainIdUpdate(chainId: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
      ...data,
      ethereum: {
        ...(data.ethereum || {}),
        chainId,
      },
    });
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
          keyringInit.mnemonic =
            this.keyringStore.activeUserKeyring.exportMnemonic();
        }
      }
      await blockchainKeyring.init(keyringInit);
    } else {
      // We are unlocked, just use the keyring
      blockchainKeyring =
        this.keyringStore.activeUserKeyring.keyringForBlockchain(blockchain);
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
    username: string,
    password: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string,
    jwt: string
  ): Promise<string> {
    await this.keyringStore.init(username, password, keyringInit, uuid, jwt);

    // Notify all listeners.
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_CREATED,
      data: {
        blockchainActiveWallets: await this.blockchainActiveWallets(),
        ethereumConnectionUrl: await this.ethereumConnectionUrlRead(uuid),
        solanaConnectionUrl: await this.solanaConnectionUrlRead(uuid),
        solanaCommitment: await this.solanaCommitmentRead(uuid),
        preferences: await this.preferencesRead(uuid),
      },
    });

    return SUCCESS_RESPONSE;
  }

  async usernameAccountCreate(
    username: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string,
    jwt: string
  ): Promise<string> {
    await this.keyringStore.usernameKeyringCreate(
      username,
      keyringInit,
      uuid,
      jwt
    );
    const walletData = await this.keyringStoreReadAllPubkeyData();
    const preferences = await this.preferencesRead(uuid);
    const xnftPreferences = await this.getXnftPreferences();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED,
      data: {
        user: {
          username,
          uuid,
          jwt,
        },
        walletData,
        preferences,
        xnftPreferences,
      },
    });

    return SUCCESS_RESPONSE;
  }

  async activeUserUpdate(uuid: string): Promise<string> {
    // Change active user account.
    const { username, jwt } = await this.keyringStore.activeUserUpdate(uuid);

    // Get data to push back to the UI.
    const walletData = await this.keyringStoreReadAllPubkeyData();

    // Get preferences to push back to the UI.
    const preferences = await this.preferencesRead(uuid);
    const xnftPreferences = await this.getXnftPreferences();
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
          jwt,
        },
        walletData,
        preferences,
        xnftPreferences,
        blockchainKeyrings,
      },
    });

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
    const ethereumConnectionUrl = await this.ethereumConnectionUrlRead(
      userInfo.uuid
    );
    const ethereumChainId = await this.ethereumChainIdRead();
    const solanaConnectionUrl = await this.solanaConnectionUrlRead(
      userInfo.uuid
    );
    const solanaCommitment = await this.solanaCommitmentRead(userInfo.uuid);

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

    return SUCCESS_RESPONSE;
  }

  keyringStoreAutoLockCountdownToggle(enable: boolean) {
    this.keyringStore.autoLockCountdownToggle(enable);
  }

  keyringStoreAutoLockCountdownRestart() {
    this.keyringStore.autoLockCountdownRestart();
  }

  keyringStoreAutoLockReset() {
    this.keyringStore.autoLockCountdownReset();
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

  async keyringStoreReadAllPubkeyData(): Promise<PublicKeyData> {
    const activePublicKeys = await this.activeWallets();
    const publicKeys = await this.keyringStoreReadAllPubkeys();
    const activeBlockchain =
      this.keyringStore.activeUserKeyring.activeBlockchain;
    return {
      activeBlockchain,
      activePublicKeys,
      publicKeys,
    };
  }

  // Returns all pubkeys available for signing.
  async keyringStoreReadAllPubkeys(): Promise<PublicKeyType> {
    const publicKeys = await this.keyringStore.publicKeys();
    const namedPublicKeys = {};
    for (const [blockchain, blockchainKeyring] of Object.entries(publicKeys)) {
      namedPublicKeys[blockchain] = {};
      for (const [keyring, publicKeys] of Object.entries(blockchainKeyring)) {
        if (!namedPublicKeys[blockchain][keyring]) {
          namedPublicKeys[blockchain][keyring] = [];
        }
        for (const publicKey of publicKeys) {
          namedPublicKeys[blockchain][keyring].push({
            publicKey,
            name: await secureStore.getKeyname(publicKey),
            isCold: await secureStore.getIsCold(publicKey),
          });
        }
      }
    }
    return namedPublicKeys;
  }

  public activeWalletForBlockchain(b: Blockchain): string | undefined {
    return this.keyringStore.activeUserKeyring
      .keyringForBlockchain(b)
      .getActiveWallet();
  }

  private async activeWallets(): Promise<Array<string>> {
    return await this.keyringStore.activeWallets();
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
    const keyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(blockchain);

    const oldBlockchain = this.keyringStore.activeUserKeyring.activeBlockchain;
    const oldActivePublicKey = keyring.getActiveWallet();

    await this.keyringStore.activeWalletUpdate(newActivePublicKey, blockchain);

    if (newActivePublicKey !== oldActivePublicKey) {
      // Public key has changed, emit an event
      // TODO: remove the blockchain specific events in favour of a single event
      if (blockchain === Blockchain.SOLANA) {
        this.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
          data: {
            activeWallet: newActivePublicKey,
            activeWallets: await this.activeWallets(),
          },
        });
      } else if (blockchain === Blockchain.ETHEREUM) {
        this.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
          data: {
            activeWallet: newActivePublicKey,
            activeWallets: await this.activeWallets(),
          },
        });
      }
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
    return Object.fromEntries(
      (await this.activeWallets()).map((publicKey) => {
        return [
          this.keyringStore.activeUserKeyring.blockchainForPublicKey(publicKey),
          publicKey,
        ];
      })
    );
  }

  async keyringReadNextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): Promise<string> {
    return this.keyringStore.nextDerivationPath(blockchain, keyring);
  }

  /**
   * Add a new wallet to the keyring using the next derived wallet for the mnemonic.
   * @param blockchain - Blockchain to add the wallet for
   */
  async keyringImportWallet(
    signedWalletDescriptor: SignedWalletDescriptor
  ): Promise<string> {
    const { blockchain } = signedWalletDescriptor;

    const { publicKey, name } = await this.keyringStore.addDerivationPath(
      blockchain,
      signedWalletDescriptor.derivationPath
    );

    try {
      await this.userAccountPublicKeyCreate(
        blockchain,
        publicKey,
        signedWalletDescriptor.signature
      );
    } catch (error) {
      // Something went wrong persisting to server, roll back changes to the
      // keyring. This is not a complete rollback of state changes, because
      // the next account index gets incremented. This is the correct behaviour
      // because it should allow for sensible retries on conflicts.
      await this.keyringKeyDelete(blockchain, publicKey);
      throw error;
    }

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_IMPORTED_WALLET,
      data: {
        blockchain,
        publicKey,
        name,
      },
    });

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

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

    try {
      await this.userAccountPublicKeyCreate(blockchain, publicKey);
    } catch (error) {
      // Something went wrong persisting to server, roll back changes to the
      // keyring. This is not a complete rollback of state changes, because
      // the next account index gets incremented. This is the correct behaviour
      // because it should allow for sensible retries on conflicts.
      await this.keyringKeyDelete(blockchain, publicKey);
      if (retries < 10) {
        // Key conflict with already exist account, retry
        // Last key will be skipped because the wallet index will have incremented
        return await this.keyringDeriveWallet(blockchain, retries);
      }
      throw error;
    }

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_DERIVED_WALLET,
      data: {
        blockchain,
        publicKey,
        name,
      },
    });

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

    // Return the newly added public key
    return publicKey.toString();
  }

  async keyIsCold(publicKey: string): Promise<boolean> {
    return await secureStore.getIsCold(publicKey);
  }

  async keyIsColdUpdate(publicKey: string, isCold: boolean): Promise<string> {
    await secureStore.setIsCold(publicKey, isCold);
    const walletData = await this.keyringStoreReadAllPubkeyData();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEY_IS_COLD_UPDATE,
      data: {
        publicKey,
        isCold,
        walletData,
      },
    });
    return SUCCESS_RESPONSE;
  }

  /**
   * Read the name associated with a public key in the local store.
   * @param publicKey - public key to read the name for
   */
  async keynameRead(publicKey: string): Promise<string> {
    return await secureStore.getKeyname(publicKey);
  }

  /**
   * Update the name associated with a public key in the local store.
   * @param publicKey - public key to update the name for
   * @param newName - new name to associate with the public key
   */
  async keynameUpdate(publicKey: string, newName: string): Promise<string> {
    await secureStore.setKeyname(publicKey, newName);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYNAME_UPDATE,
      data: {
        publicKey,
        name: newName,
      },
    });
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
    const keyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(blockchain);

    let nextActivePublicKey: string | undefined;
    const activeWallet = keyring.getActiveWallet();
    // If we're removing the currently active key then we need to update it
    // first.
    if (activeWallet === publicKey) {
      // Find remaining public keys
      nextActivePublicKey = Object.values(keyring.publicKeys())
        .flat()
        .find((k) => k !== keyring.getActiveWallet());
      // Set the next active public key if we deleted the active one. Note this
      // is a local state change so it needs to come after the API request to
      // remove the public key
      if (nextActivePublicKey) {
        // Set the active public key to another public key on the same
        // blockchain if possible
        await this.activeWalletUpdate(nextActivePublicKey, blockchain);
      } else {
        // No public key on the currently active blockchain could be found,
        // which means that we've removed the last public key from the active
        // blockchain keyring. We need to set a new active blockchain and
        // public key.
        const newBlockchain = (await this.blockchainKeyringsRead()).find(
          (b: Blockchain) => b !== blockchain
        );
        if (!newBlockchain) {
          throw new Error("cannot delete the last public key");
        }
        const newPublicKey = Object.values(
          (await this.keyringStoreReadAllPubkeys())[newBlockchain]
        ).flat()[0].publicKey;
        // Update the active wallet
        await this.activeWalletUpdate(newPublicKey, newBlockchain);
      }
    }

    // Remove the public key from the Backpack API
    await this.userAccountPublicKeyDelete(blockchain, publicKey);

    await this.keyringStore.keyDelete(blockchain, publicKey);

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_KEY_DELETE,
      data: {
        blockchain,
        deletedPublicKey: publicKey,
      },
    });

    const emptyKeyring =
      Object.values(keyring.publicKeys()).flat().length === 0;
    if (emptyKeyring) {
      // Keyring has no public keys, remove
      await this.keyringStore.blockchainKeyringRemove(blockchain);
      const publicKeyData = await this.keyringStoreReadAllPubkeyData();
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_BLOCKCHAIN_KEYRING_DELETED,
        data: {
          blockchain,
          publicKeyData,
        },
      });
    }

    return SUCCESS_RESPONSE;
  }

  // Returns the active username.
  // We read this directly from storage so that we can use it even when the
  // keyring is locked.
  async userRead(): Promise<User> {
    try {
      const user = await secureStore.getActiveUser();
      return user;
    } catch (err) {
      return { username: "", uuid: "", jwt: "" };
    }
  }

  async userJwtUpdate(uuid: string, jwt: string) {
    await secureStore.setUser(uuid, { jwt });

    const walletData = await this.keyringStoreReadAllPubkeyData();
    const preferences = await this.preferencesRead(uuid);
    const xnftPreferences = await this.getXnftPreferences();
    const blockchainKeyrings = await this.blockchainKeyringsRead();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
      data: {
        user: {
          uuid,
          username: this.keyringStore.activeUserKeyring.username,
          jwt,
        },
        walletData,
        preferences,
        xnftPreferences,
        blockchainKeyrings,
      },
    });

    return SUCCESS_RESPONSE;
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

    try {
      await this.userAccountPublicKeyCreate(blockchain, publicKey);
    } catch (error) {
      // Something went wrong persisting to server, roll back changes to the
      // keyring.
      await this.keyringKeyDelete(blockchain, publicKey);
      throw error;
    }

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
      data: {
        blockchain,
        publicKey,
        name: _name,
      },
    });

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

    return publicKey;
  }

  keyringExportSecretKey(password: string, pubkey: string): string {
    return this.keyringStore.exportSecretKey(password, pubkey);
  }

  keyringExportMnemonic(password: string): string {
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
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_AUTO_LOCK_SETTINGS_UPDATED,
      data: {
        autoLockSettings: {
          seconds,
          option,
        },
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringReset(): Promise<string> {
    await this.keyringStore.reset();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_RESET,
    });
    return SUCCESS_RESPONSE;
  }

  async ledgerImport(signedWalletDescriptor: SignedWalletDescriptor) {
    const { signature, ...walletDescriptor } = signedWalletDescriptor;
    const { blockchain, publicKey } = walletDescriptor;
    await this.keyringStore.ledgerImport(walletDescriptor);
    try {
      await this.userAccountPublicKeyCreate(blockchain, publicKey, signature);
    } catch (error) {
      // Something went wrong persisting to server, roll back changes to the
      // keyring.
      await this.keyringKeyDelete(blockchain, publicKey);
      throw error;
    }
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

  /**
   * Attempt to recover unrecovered wallets that exist on the keyring mnemonic.
   */
  async mnemonicSync(
    serverPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>
  ) {
    const blockchains = [...new Set(serverPublicKeys.map((x) => x.blockchain))];
    for (const blockchain of blockchains) {
      const recoveryPaths = getRecoveryPaths(blockchain);
      const mnemonic = this.keyringStore.activeUserKeyring.exportMnemonic();
      const publicKeys = await this.previewPubkeys(
        blockchain,
        mnemonic,
        recoveryPaths
      );

      //
      // The set of all keys currently in the keyring store. Don't try to sync
      // a key if it's already client side.
      //
      const allLocalKeys = Object.values(
        await this.keyringStoreReadAllPubkeys()
      )
        .map((p) =>
          p.hdPublicKeys
            .concat(p.importedPublicKeys)
            .concat(p.ledgerPublicKeys)
            .map((p) => p.publicKey)
        )
        .reduce((a, b) => a.concat(b), []);

      const searchPublicKeys = serverPublicKeys
        .filter((b) => b.blockchain === blockchain)
        .map((p) => p.publicKey)
        .filter((p) => !allLocalKeys.includes(p));

      for (const searchPublicKey of searchPublicKeys) {
        const index = publicKeys.findIndex(
          (p: string) => p === searchPublicKey
        );
        if (index !== -1) {
          // There is a match among the recovery paths
          let blockchainKeyring: BlockchainKeyring | undefined = undefined;
          // Check if the blockchain keyring already exists
          try {
            blockchainKeyring =
              this.keyringStore.activeUserKeyring.keyringForBlockchain(
                blockchain
              );
          } catch {
            // Doesn't exist, we can create it
          }
          if (blockchainKeyring) {
            let [publicKey, name] = await (async () => {
              const derivationPath = recoveryPaths[index];
              if (!blockchainKeyring.hasHdKeyring()) {
                const [[publicKey, name]] =
                  await blockchainKeyring.initHdKeyring(mnemonic, [
                    derivationPath,
                  ]);
                return [publicKey, name];
              } else {
                // Exists, just add the missing derivation path
                const { publicKey, name } =
                  await this.keyringStore.activeUserKeyring
                    .keyringForBlockchain(blockchain)
                    .addDerivationPath(derivationPath);
                return [publicKey, name];
              }
            })();
            this.events.emit(BACKEND_EVENT, {
              name: NOTIFICATION_KEYRING_DERIVED_WALLET,
              data: {
                blockchain,
                publicKey,
                name,
              },
            });
          } else {
            // Create blockchain keyring
            const walletDescriptor = {
              blockchain,
              publicKey: publicKeys[index],
              derivationPath: recoveryPaths[index],
            };
            await this.blockchainKeyringsAdd({
              mnemonic,
              signedWalletDescriptors: [
                {
                  ...walletDescriptor,
                  signature: "",
                },
              ],
            });
          }
        }
      }
    }
  }

  keyringHasMnemonic(): boolean {
    return this.keyringStore.activeUserKeyring.hasMnemonic();
  }

  keyringSetMnemonic(mnemonic: string) {
    this.keyringStore.activeUserKeyring.setMnemonic(mnemonic);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_SET_MNEMONIC,
    });
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

  ///////////////////////////////////////////////////////////////////////////////
  // User account.
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Add a public key to a Backpack account via the Backpack API.
   */
  public async userAccountPublicKeyCreate(
    blockchain: Blockchain,
    publicKey: string,
    signature?: string
  ) {
    // Persist the newly added public key to the Backpack API
    if (!signature) {
      // Signature should only be undefined for non hardware wallets
      signature = await this.signMessageForPublicKey(
        blockchain,
        publicKey,
        bs58.encode(Buffer.from(getAddMessage(publicKey), "utf-8"))
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/users/publicKeys`, {
      method: "POST",
      body: JSON.stringify({
        blockchain,
        signature,
        publicKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error((await response.json()).msg);
    }

    // 204 => the key was already created on the server previously.
    if (response.status === 204) {
      return;
    }

    const primary = (await response.json()).isPrimary;

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_CREATED,
      data: {
        blockchain,
        publicKey,
        primary,
      },
    });
  }

  /**
   * Remove a public key from a Backpack account via the Backpack API.
   */
  async userAccountPublicKeyDelete(blockchain: Blockchain, publicKey: string) {
    // Remove the key from the server
    const response = await fetch(`${BACKEND_API_URL}/users/publicKeys`, {
      method: "DELETE",
      body: JSON.stringify({
        blockchain,
        publicKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("could not remove public key");
    }

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_DELETED,
      data: {
        blockchain,
        publicKey,
      },
    });

    return SUCCESS_RESPONSE;
  }

  /**
   * Attempt to authenticate a Backpack account using the Backpack API.
   */
  async userAccountAuth(
    blockchain: Blockchain,
    publicKey: string,
    message: string,
    signature: string
  ) {
    const response = await fetch(`${BACKEND_API_URL}/authenticate`, {
      method: "POST",
      body: JSON.stringify({
        blockchain,
        publicKey,
        message: bs58.encode(Buffer.from(message, "utf-8")),
        signature,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) throw new Error(`could not authenticate`);

    const json = await response.json();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_USER_ACCOUNT_AUTHENTICATED,
      data: {
        username: json.username,
        uuid: json.id,
        jwt: json.jwt,
      },
    });

    return json;
  }

  /**
   * Logout a Backpack account using the Backpack API.
   */
  async userAccountLogout(uuid: string): Promise<string> {
    // Clear the jwt cookie if it exists. Don't block.
    await fetch(`${BACKEND_API_URL}/authenticate`, {
      method: "DELETE",
    });

    //
    // If we're logging out the last user, reset the entire app.
    //
    const data = await secureStore.getUserData();
    if (data.users.length === 1) {
      await this.keyringReset();
      return SUCCESS_RESPONSE;
    }

    //
    // If we have more users available, just remove the user.
    //
    const isNewActiveUser = await this.keyringStore.removeUser(uuid);

    //
    // If the user changed, notify the UI.
    //
    if (isNewActiveUser) {
      const user = await this.userRead();
      const walletData = await this.keyringStoreReadAllPubkeyData();
      const preferences = await this.preferencesRead(uuid);
      const xnftPreferences = await this.getXnftPreferences();
      const blockchainKeyrings = await this.blockchainKeyringsRead();

      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
        data: {
          user,
          walletData,
          preferences,
          xnftPreferences,
          blockchainKeyrings,
        },
      });
    } else {
      //
      // Notify the UI about the removal.
      //
      this.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_KEYRING_STORE_REMOVED_USER,
      });
    }

    //
    // Done.
    //
    return SUCCESS_RESPONSE;
  }

  /**
   * Read a Backpack account from the Backpack API.
   */
  async userAccountRead(jwt?: string) {
    const headers = {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    };
    const response = await fetch(`${BACKEND_API_URL}/users/me`, {
      method: "GET",
      headers,
    });
    if (response.status === 403) {
      throw new Error("user not authenticated");
    } else if (response.status === 404) {
      // User does not exist on server, how to handle?
      throw new Error("user does not exist");
    } else if (response.status !== 200) {
      throw new Error(`could not fetch user`);
    }

    const json = await response.json();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_USER_ACCOUNT_AUTHENTICATED,
      data: {
        username: json.username,
        uuid: json.id,
        jwt: json.jwt,
      },
    });

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_USER_ACCOUNT_PUBLIC_KEYS_UPDATED,
      data: {
        publicKeys: json.publicKeys,
      },
    });
    return json;
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
      mnemonic = this.keyringStore.activeUserKeyring.exportMnemonic();
    const recoveryPaths = getAccountRecoveryPaths(blockchain, accountIndex);
    const publicKeys = await this.previewPubkeys(
      blockchain,
      mnemonic!,
      recoveryPaths
    );
    const users = await this.findServerPublicKeyConflicts(
      publicKeys.map((publicKey) => ({
        blockchain,
        publicKey,
      }))
    );
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

  /**
   * Query the Backpack API to check if a user has already used any of the
   * blockchain/public key pairs from a list.
   */
  async findServerPublicKeyConflicts(
    serverPublicKeys: ServerPublicKey[]
  ): Promise<string[]> {
    const url = `${BACKEND_API_URL}/publicKeys`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(serverPublicKeys),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r) => r.json());

    return response;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Preferences.
  ///////////////////////////////////////////////////////////////////////////////

  async darkModeRead(uuid: string): Promise<boolean> {
    const state = await this.keyringStoreState();
    if (state === "needs-onboarding") {
      return DEFAULT_DARK_MODE;
    }
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.darkMode ?? DEFAULT_DARK_MODE;
  }

  async darkModeUpdate(darkMode: boolean): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
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

  async developerModeRead(uuid: string): Promise<boolean> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.developerMode ?? false;
  }

  async developerModeUpdate(developerMode: boolean): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
      ...data,
      developerMode,
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_DEVELOPER_MODE_UPDATED,
      data: {
        developerMode,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async aggregateWalletsUpdate(aggregateWallets: boolean): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
      ...data,
      aggregateWallets,
    });
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_AGGREGATE_WALLETS_UPDATED,
      data: {
        aggregateWallets,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async isApprovedOrigin(origin: string): Promise<boolean> {
    const { uuid } = await this.userRead();
    const data = await secureStore.getWalletDataForUser(uuid);
    if (!data.approvedOrigins) {
      return false;
    }
    const found = data.approvedOrigins.find((o) => o === origin);
    return found !== undefined;
  }

  async approvedOriginsRead(uuid: string): Promise<Array<string>> {
    const data = await secureStore.getWalletDataForUser(uuid);
    return data.approvedOrigins;
  }

  async approvedOriginsUpdate(approvedOrigins: Array<string>): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    await secureStore.setWalletDataForUser(uuid, {
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
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await secureStore.getWalletDataForUser(uuid);
    const approvedOrigins = data.approvedOrigins.filter((o) => o !== origin);
    await secureStore.setWalletDataForUser(uuid, {
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
  // Blockchains
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Add a new blockchain keyring to the keyring store (i.e. initialize it).
   */
  async blockchainKeyringsAdd(
    keyringInit: MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit
  ): Promise<string> {
    const { blockchain, signature, publicKey } =
      "signedWalletDescriptors" in keyringInit
        ? keyringInit.signedWalletDescriptors[0]
        : keyringInit;

    await this.keyringStore.blockchainKeyringAdd(blockchain, keyringInit);

    // Add the new public key to the API
    try {
      await this.userAccountPublicKeyCreate(blockchain, publicKey, signature);
    } catch (error) {
      // Roll back the added blockchain keyring
      await this.keyringStore.blockchainKeyringRemove(blockchain);
      throw error;
    }

    const publicKeyData = await this.keyringStoreReadAllPubkeyData();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_BLOCKCHAIN_KEYRING_CREATED,
      data: {
        blockchain,
        activeWallet: publicKey,
        publicKeyData,
      },
    });

    return publicKey;
  }

  /**
   * Return all blockchains that have initialised keyrings, even if they are not
   * enabled.
   */
  async blockchainKeyringsRead(): Promise<Array<Blockchain>> {
    return this.keyringStore.activeUserKeyring.blockchainKeyrings();
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

  async setXnftPreferences(xnftId: string, preference: XnftPreference) {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
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

  async getXnftPreferences() {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
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

    const targetTab = tab ?? nav.activeTab;

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
    const targetTab = tab ?? nav.activeTab;
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

  async navigationOpenChat(chatName: string): Promise<string> {
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

function setSearchParam(url: string, key: string, value: string): string {
  const [path, search] = url.split("?");
  const searchParams = new URLSearchParams(search);
  searchParams.delete(key);
  searchParams.append(key, value);
  return `${path}?${searchParams.toString()}`;
}
