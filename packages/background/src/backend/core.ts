import { keyringForBlockchain } from "@coral-xyz/blockchain-common";
import type { BlockchainKeyring } from "@coral-xyz/blockchain-keyring";
import type {
  DerivationPath,
  EventEmitter,
  FEATURE_GATES_MAP,
  KeyringInit,
  KeyringType,
  XnftPreference,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKEND_EVENT,
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  Blockchain,
  deserializeTransaction,
  EthereumConnectionUrl,
  EthereumExplorer,
  getAddMessage,
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
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_KEY_DELETE,
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
  NOTIFICATION_XNFT_PREFERENCE_UPDATED,
  SolanaCluster,
  SolanaExplorer,
  TAB_XNFT,
} from "@coral-xyz/common";
import type { KeyringStoreState } from "@coral-xyz/recoil";
import {
  KeyringStoreStateEnum,
  makeDefaultNav,
  makeUrl,
} from "@coral-xyz/recoil";
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

import type { EthereumConnectionBackend } from "./ethereum-connection";
import { defaultPreferences, KeyringStore } from "./keyring";
import type { SolanaConnectionBackend } from "./solana-connection";
import type { Nav, User } from "./store";
import * as store from "./store";
import {
  DEFAULT_DARK_MODE,
  getWalletDataForUser,
  setUser,
  setWalletDataForUser,
} from "./store";

// TODO move type to common
type NamedPublicKeys = Array<{ name: string; publicKey: string }>;

const { base58: bs58 } = ethers.utils;

const jwtEnabled = !!(BACKPACK_FEATURE_USERNAMES && BACKPACK_FEATURE_JWT);

export function start(
  events: EventEmitter,
  solanaB: SolanaConnectionBackend,
  ethereumB: EthereumConnectionBackend
) {
  return new Backend(events, solanaB, ethereumB);
}

export class Backend {
  private keyringStore: KeyringStore;
  private solanaConnectionBackend: SolanaConnectionBackend;
  private ethereumConnectionBackend: EthereumConnectionBackend;
  private events: EventEmitter;

  constructor(
    events: EventEmitter,
    solanaB: SolanaConnectionBackend,
    ethereumB: EthereumConnectionBackend
  ) {
    this.keyringStore = new KeyringStore(events);
    this.solanaConnectionBackend = solanaB;
    this.ethereumConnectionBackend = ethereumB;
    this.events = events;
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

  async solanaSimulate(
    txStr: string,
    walletAddress: string,
    includeAccounts?: boolean | Array<string>
  ): Promise<any> {
    const tx = deserializeTransaction(txStr);
    const signersOrConf =
      "message" in tx
        ? ({
            accounts: {
              encoding: "base64",
              addresses: [new PublicKey(walletAddress).toBase58()],
            },
          } as SimulateTransactionConfig)
        : undefined;

    return await this.solanaConnectionBackend.simulateTransaction(
      tx,
      signersOrConf,
      typeof includeAccounts === "boolean"
        ? includeAccounts
        : includeAccounts && includeAccounts.map((a) => new PublicKey(a))
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
    let data = await getWalletDataForUser(uuid);

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
      await setWalletDataForUser(uuid, data);
    }

    return (data.solana && data.solana.cluster) ?? SolanaCluster.DEFAULT;
  }

  // Returns true if the url changed.
  async solanaConnectionUrlUpdate(cluster: string): Promise<boolean> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await getWalletDataForUser(uuid);

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

    await setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    return data.solana && data.solana.explorer
      ? data.solana.explorer
      : SolanaExplorer.DEFAULT;
  }

  async solanaExplorerUpdate(explorer: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    return data.solana && data.solana.commitment
      ? data.solana.commitment
      : "processed";
  }

  async solanaCommitmentUpdate(commitment: Commitment): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    return data.ethereum && data.ethereum.explorer
      ? data.ethereum.explorer
      : EthereumExplorer.DEFAULT;
  }

  async ethereumExplorerUpdate(explorer: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    return data.ethereum && data.ethereum.connectionUrl
      ? data.ethereum.connectionUrl
      : EthereumConnectionUrl.DEFAULT;
  }

  async ethereumConnectionUrlUpdate(connectionUrl: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);

    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(
      this.keyringStore.activeUserKeyring.uuid
    );
    return data.ethereum && data.ethereum.chainId
      ? data.ethereum.chainId
      : // Default to mainnet
        "0x1";
  }

  async ethereumChainIdUpdate(chainId: string): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
   * This is used during onboarding to sign messages prior to the store being initialised.
   */
  async signMessageForPublicKey(
    blockchain: Blockchain,
    msg: string,
    publicKey: string,
    keyringInit?: {
      derivationPath: DerivationPath;
      accountIndex: number;
      mnemonic?: string;
    }
  ) {
    if (
      !keyringInit &&
      (await this.keyringStoreState()) !== KeyringStoreStateEnum.Unlocked
    ) {
      throw new Error(
        "provide a keyring init or unlock keyring to sign message"
      );
    }

    let blockchainKeyring: BlockchainKeyring;

    // If keyring init parameters were provided then init the keyring
    if (keyringInit) {
      // Create an empty keyring to init
      blockchainKeyring = keyringForBlockchain(blockchain);
      if (keyringInit.mnemonic) {
        // Using a mnemonic
        blockchainKeyring.initFromMnemonic(
          keyringInit.mnemonic,
          keyringInit.derivationPath,
          [keyringInit.accountIndex]
        );
      } else {
        // Using a ledger
        blockchainKeyring.initFromLedger([
          {
            path: keyringInit.derivationPath,
            account: keyringInit.accountIndex,
            publicKey,
          },
        ]);
      }
    } else {
      blockchainKeyring =
        this.keyringStore.activeUserKeyring.keyringForBlockchain(blockchain);
    }

    // Check if the keyring was initialised properly or if the existing stored
    // keyring has the correct public key
    if (!blockchainKeyring.hasPublicKey(publicKey)) {
      throw new Error("invalid public key or keyring init");
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
    keyringInit: KeyringInit,
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
    keyringInit: KeyringInit,
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

  async userLogout(uuid: string): Promise<string> {
    // Clear the jwt cookie if it exists. Don't block.
    fetch(`${BACKEND_API_URL}/authenticate`, {
      method: "DELETE",
    });

    //
    // If we're logging out the last user, reset the entire app.
    //
    const data = await store.getUserData();
    if (data.users.length === 1) {
      this.keyringReset();
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
    }

    //
    // Notify the UI about the removal.
    //
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_REMOVED_USER,
    });

    //
    // Done.
    //
    return SUCCESS_RESPONSE;
  }

  async keyringStoreCheckPassword(password: string): Promise<boolean> {
    return await this.keyringStore.checkPassword(password);
  }

  async keyringStoreUnlock(
    password: string,
    uuid: string,
    username?: string
  ): Promise<string> {
    if (!username) {
      throw new Error("invariant violation: username not found");
    }

    await this.keyringStore.tryUnlock(password, uuid);

    const blockchainActiveWallets = await this.blockchainActiveWallets();

    const ethereumConnectionUrl = await this.ethereumConnectionUrlRead(uuid);
    const ethereumChainId = await this.ethereumChainIdRead();
    const solanaConnectionUrl = await this.solanaConnectionUrlRead(uuid);
    const solanaCommitment = await this.solanaCommitmentRead(uuid);

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
      data: {
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

  async keyringStoreReadAllPubkeyData(): Promise<{
    activeBlockchain: Blockchain;
    activePublicKeys: Array<string>;
    publicKeys: {
      [blockchain: string]: {
        hdPublicKeys: NamedPublicKeys;
        importedPublicKeys: NamedPublicKeys;
        ledgerPublicKeys: NamedPublicKeys;
      };
    };
  }> {
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
  async keyringStoreReadAllPubkeys(): Promise<{
    [blockchain: string]: {
      hdPublicKeys: NamedPublicKeys;
      importedPublicKeys: NamedPublicKeys;
      ledgerPublicKeys: NamedPublicKeys;
    };
  }> {
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
            name: await store.getKeyname(publicKey),
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

  async preferencesRead(uuid: string): Promise<any> {
    //
    // First time onboarding this will throw an error, in which case
    // we return a default set of preferences.
    //
    try {
      return await store.getWalletDataForUser(uuid);
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

  /**
   * Add a new wallet to the keyring using the next derived wallet for the mnemonic.
   * @param blockchain - Blockchain to add the wallet for
   */
  async keyringDeriveWallet(blockchain: Blockchain): Promise<string> {
    const [publicKey, name] = await this.keyringStore.deriveNextKey(blockchain);

    if (jwtEnabled) {
      try {
        await this._addPublicKeyToAccount(blockchain, publicKey);
      } catch (error) {
        // Something went wrong persisting to server, roll back changes to the
        // keyring. This is not a complete rollback of state changes, because
        // the next account index gets incremented. This is the correct behaviour
        // because it should allow for sensible retries on conflicts.
        await this.keyringKeyDelete(blockchain, publicKey);
        throw error;
      }
    }

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_DERIVED_WALLET,
      data: {
        blockchain,
        publicKey: publicKey.toString(),
        name,
      },
    });

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(publicKey, blockchain);

    // Return the newly added public key
    return publicKey.toString();
  }

  /**
   * Read the name associated with a public key in the local store.
   * @param publicKey - public key to read the name for
   */
  async keynameRead(publicKey: string): Promise<string> {
    return await store.getKeyname(publicKey);
  }

  /**
   * Update the name associated with a public key in the local store.
   * @param publicKey - public key to update the name for
   * @param newName - new name to associate with the public key
   */
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

  /**
   * Remove a wallet from the keyring and delete the public key record on the server.
   * @param blockchain - Blockchain for the public key
   * @param publickey
   */
  async keyringKeyDelete(
    blockchain: Blockchain,
    publicKey: string
  ): Promise<string> {
    const keyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(blockchain);

    // If we're removing the currently active key then we need to update it
    // first.
    let nextActivePublicKey: string | undefined;
    if (keyring.getActiveWallet() === publicKey) {
      // Find remaining public keys
      nextActivePublicKey = Object.values(keyring.publicKeys())
        .flat()
        .find((k) => k !== keyring.getActiveWallet());
      if (!nextActivePublicKey) {
        throw new Error("cannot delete last public key");
      }
    }

    if (jwtEnabled) {
      await this._removePublicKeyFromAccount(blockchain, publicKey);
    }

    // Set the next active public key if we deleted the active one. Note this
    // is a local state change so it needs to come after the API request to
    // remove the public key
    if (nextActivePublicKey) {
      await this.activeWalletUpdate(nextActivePublicKey, blockchain);
    }

    await this.keyringStore.keyDelete(blockchain, publicKey);

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_KEY_DELETE,
      data: {
        blockchain,
        deletedPublicKey: publicKey,
      },
    });

    return SUCCESS_RESPONSE;
  }

  // Returns the active username.
  // We read this directly from storage so that we can use it even when the
  // keyring is locked.
  async userRead(): Promise<User> {
    try {
      const user = await store.getActiveUser();
      return user;
    } catch (err) {
      return { username: "", uuid: "", jwt: "" };
    }
  }

  async userJwtUpdate(uuid: string, jwt: string) {
    await setUser(uuid, { jwt });

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
    const userData = await store.getUserData();
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

    if (jwtEnabled) {
      try {
        await this._addPublicKeyToAccount(blockchain, publicKey);
      } catch (error) {
        // Something went wrong persisting to server, roll back changes to the
        // keyring.
        await this.keyringKeyDelete(blockchain, publicKey);
        throw error;
      }
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
    const data = await store.getWalletDataForUser(uuid);
    return data.autoLockSettings;
  }

  async keyringAutoLockSettingsUpdate(
    seconds?: number,
    option?: string
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

  keyringReset(): string {
    this.keyringStore.reset();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_RESET,
    });
    return SUCCESS_RESPONSE;
  }

  async ledgerImport(
    blockchain: Blockchain,
    derivationPath: string,
    account: number,
    publicKey: string,
    signature?: string
  ) {
    await this.keyringStore.ledgerImport(
      blockchain,
      derivationPath,
      account,
      publicKey
    );
    if (jwtEnabled) {
      try {
        await this._addPublicKeyToAccount(blockchain, publicKey, signature);
      } catch (error) {
        // Something went wrong persisting to server, roll back changes to the
        // keyring.
        await this.keyringKeyDelete(blockchain, publicKey);
        throw error;
      }
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

  keyringTypeRead(): KeyringType {
    return this.keyringStore.activeUserKeyring.hasMnemonic()
      ? "mnemonic"
      : "ledger";
  }

  async previewPubkeys(
    blockchain: Blockchain,
    mnemonic: string,
    derivationPath: DerivationPath,
    numberOfAccounts: number
  ) {
    return this.keyringStore.previewPubkeys(
      blockchain,
      mnemonic,
      derivationPath,
      numberOfAccounts
    );
  }

  /**
   * Helper method to add a public key to a Backpack account via the Backpack API.
   */
  async _addPublicKeyToAccount(
    blockchain: Blockchain,
    publicKey: string,
    signature?: string
  ) {
    // Persist the newly added public key to the Backpack API
    if (!signature) {
      // Signature should only be undefined for non hardware wallets
      signature = await this.signMessageForPublicKey(
        blockchain,
        bs58.encode(Buffer.from(getAddMessage(publicKey), "utf-8")),
        publicKey
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
  }

  /**
   * Helper method to add remove a public key from a Backpack account via the Backpack API.
   */
  async _removePublicKeyFromAccount(blockchain: Blockchain, publicKey: string) {
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
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Preferences.
  ///////////////////////////////////////////////////////////////////////////////

  async darkModeRead(uuid: string): Promise<boolean> {
    const state = await this.keyringStoreState();
    if (state === "needs-onboarding") {
      return DEFAULT_DARK_MODE;
    }
    const data = await store.getWalletDataForUser(uuid);
    return data.darkMode ?? DEFAULT_DARK_MODE;
  }

  async darkModeUpdate(darkMode: boolean): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    return data.developerMode ?? false;
  }

  async developerModeUpdate(developerMode: boolean): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    if (!data.approvedOrigins) {
      return false;
    }
    const found = data.approvedOrigins.find((o) => o === origin);
    return found !== undefined;
  }

  async approvedOriginsRead(uuid: string): Promise<Array<string>> {
    const data = await store.getWalletDataForUser(uuid);
    return data.approvedOrigins;
  }

  async approvedOriginsUpdate(approvedOrigins: Array<string>): Promise<string> {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    await store.setWalletDataForUser(uuid, {
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
    const data = await store.getWalletDataForUser(uuid);
    const approvedOrigins = data.approvedOrigins.filter((o) => o !== origin);
    await store.setWalletDataForUser(uuid, {
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
    blockchain: Blockchain,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string,
    signature?: string
  ): Promise<string> {
    const newPublicKey = await this.keyringStore.blockchainKeyringAdd(
      blockchain,
      derivationPath,
      accountIndex,
      publicKey
    );

    // Add the new public key to the API
    if (jwtEnabled) {
      try {
        await this._addPublicKeyToAccount(blockchain, newPublicKey, signature);
      } catch (error) {
        // Roll back the added blockchain keyring
        await this.keyringStore.blockchainKeyringRemove(blockchain);
        throw error;
      }
    }

    const publicKeyData = await this.keyringStoreReadAllPubkeyData();

    // Set the active wallet to the newly added public key
    await this.activeWalletUpdate(newPublicKey, blockchain);

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_BLOCKCHAIN_KEYRING_CREATED,
      data: {
        blockchain,
        activeWallet: newPublicKey,
        publicKeyData,
      },
    });

    return newPublicKey;
  }

  async blockchainKeyringsDelete(blockchain: Blockchain): Promise<void> {
    // If the keyring being removed is active, set a new active keyring
    const activeBlockchain =
      this.keyringStore.activeUserKeyring.activeBlockchain;
    if (activeBlockchain === blockchain) {
      const remainingBlockchains = (await this.blockchainKeyringsRead()).filter(
        (b) => b !== blockchain
      );
      if (remainingBlockchains.length === 0) {
        throw new Error("cannot delete the only blockchain keyring");
      }
      const newBlockchain = remainingBlockchains[0] as Blockchain;
      const newPublicKey = Object.values(
        (await this.keyringStoreReadAllPubkeys())[newBlockchain]
      ).flat()[0].publicKey;
      await this.activeWalletUpdate(newPublicKey, newBlockchain);
    }

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

  /**
   * Return all blockchains that have initialised keyrings, even if they are not
   * enabled.
   */
  async blockchainKeyringsRead(): Promise<Array<Blockchain>> {
    return this.keyringStore.activeUserKeyring.blockchainKeyrings();
  }

  async setFeatureGates(gates: FEATURE_GATES_MAP) {
    await store.setFeatureGates(gates);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_FEATURE_GATES_UPDATED,
      data: {
        gates,
      },
    });
  }

  async getFeatureGates() {
    return await store.getFeatureGates();
  }

  async setXnftPreferences(xnftId: string, preference: XnftPreference) {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    const currentPreferences =
      (await store.getXnftPreferencesForUser(uuid)) || {};
    const updatedPreferences = {
      ...currentPreferences,
      [xnftId]: {
        ...(currentPreferences[xnftId] || {}),
        ...preference,
      },
    };
    await store.setXnftPreferencesForUser(uuid, updatedPreferences);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_XNFT_PREFERENCE_UPDATED,
      data: { updatedPreferences },
    });
  }

  async getXnftPreferences() {
    const uuid = this.keyringStore.activeUserKeyring.uuid;
    return await store.getXnftPreferencesForUser(uuid);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Navigation.
  ///////////////////////////////////////////////////////////////////////////////

  async navigationPush(url: string, tab?: string): Promise<string> {
    let nav = await store.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }
    const targetTab = tab ?? nav.activeTab;

    nav.data[targetTab] = nav.data[targetTab] ?? { id: targetTab, urls: [] };

    const urls = nav.data[targetTab].urls;

    if (urls.length > 0 && urls[urls.length - 1] === url) {
      return SUCCESS_RESPONSE;
    }

    nav.data[targetTab].urls.push(url);

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

  async navigationPop(tab?: string): Promise<string> {
    let nav = await store.getNav();
    if (!nav) {
      throw new Error("nav not found");
    }
    const targetTab = tab ?? nav.activeTab;
    nav.data[targetTab] = nav.data[targetTab] ?? { id: targetTab, urls: [] };
    nav.data[targetTab].urls.pop();
    await store.setNav(nav);

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
    await store.setNav(defaultNav);
    return SUCCESS_RESPONSE;
  }

  async navigationToRoot(): Promise<string> {
    let nav = await store.getNav();
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

  async navReadUrl(): Promise<string> {
    const nav = await this.navRead();
    let urls = nav.data[nav.activeTab].urls;
    if (nav.data[TAB_XNFT]?.urls.length > 0) {
      urls = nav.data[TAB_XNFT].urls;
    }
    return urls[urls.length - 1];
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

    // Newly introduced messages tab needs to be added to the
    // store for backward compatability
    if (activeTab === "messages" && !nav.data[activeTab]) {
      nav.data[activeTab] = {
        id: "messages",
        urls: [makeUrl("messages", { title: "Messages", props: {} })],
      };
    }
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

  async navigationCurrentUrlUpdate(
    url: string,
    activeTab?: string
  ): Promise<string> {
    // Get the tab nav.
    const currNav = await store.getNav();
    if (!currNav) {
      throw new Error("invariant violation");
    }

    // Update the active tab's nav stack.
    const navData = currNav.data[activeTab ?? currNav.activeTab];
    if (!navData) {
      // We exit gracefully so that we don't crash the app.
      console.error(`navData not found for tab ${activeTab}`);
      return SUCCESS_RESPONSE;
    }
    navData.urls[navData.urls.length - 1] = url;
    currNav.data[activeTab ?? currNav.activeTab] = navData;

    // Save the change.
    await store.setNav(currNav);

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

  async pluginLocalStorageGet(xnftAddress: string, key: string): Promise<any> {
    return await store.LocalStorageDb.get(`${xnftAddress}:${key}`);
  }

  async pluginLocalStoragePut(
    xnftAddress: string,
    key: string,
    value: any
  ): Promise<any> {
    await store.LocalStorageDb.set(`${xnftAddress}:${key}`, value);
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
