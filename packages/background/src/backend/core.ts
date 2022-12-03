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
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_AUTO_LOCK_SECS_UPDATED,
  NOTIFICATION_BLOCKCHAIN_DISABLED,
  NOTIFICATION_BLOCKCHAIN_ENABLED,
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
} from "@coral-xyz/common";
import type { KeyringStoreState } from "@coral-xyz/recoil";
import { makeDefaultNav, makeUrl } from "@coral-xyz/recoil";
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
  setWalletDataForUser,
} from "./store";

const { base58: bs58 } = ethers.utils;

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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const tx = deserializeTransaction(txStr);
    const message = tx.message.serialize();
    const txMessage = bs58.encode(message);
    const blockchainKeyring =
      this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
        Blockchain.SOLANA
      );
    return await blockchainKeyring.signTransaction(txMessage, walletAddress);
  }

  async solanaSignMessage(msg: string, walletAddress: string): Promise<string> {
    const blockchainKeyring =
      this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
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

  solanaDisconnect() {
    // todo
    return SUCCESS_RESPONSE;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
    const data = await getWalletDataForUser(uuid);

    if (data.solana.cluster === cluster) {
      return false;
    }

    let keyring: BlockchainKeyring | null;
    try {
      keyring = this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
      this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
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
      this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
      keyring = this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
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
      this.keyringStore.activeUsernameKeyring.uuid
    );
    return data.ethereum && data.ethereum.chainId
      ? data.ethereum.chainId
      : // Default to mainnet
        "0x1";
  }

  async ethereumChainIdUpdate(chainId: string): Promise<string> {
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
   * attempts to sign a message with one of public keys provided, it will try to use
   * a non-ledger pubkey if that's a possibility
   * @param msg message to be signed
   * @param publicKeysIncludingBlockchain Array<{ blockchain: string; publickey: string; }>
   * @returns
   */
  async tryToSignMessage(
    msg: string,
    publicKeysIncludingBlockchain: Array<{
      blockchain: Blockchain;
      publickey: string;
    }>
  ) {
    try {
      const encodedMessage = bs58.encode(Buffer.from(msg));
      // fetch all keys in the store
      const keys = await this.keyringStore.publicKeys();

      // return the first matching hot wallet address from the store, or return a
      // matching ledger wallet address if none exist
      const match:
        | { blockchain: Blockchain; publickey: string; ledger: boolean }
        | undefined = (() => {
        let _match: any;
        for (const { blockchain, publickey } of publicKeysIncludingBlockchain) {
          if (
            keys[blockchain]?.hdPublicKeys.includes(publickey) ||
            keys[blockchain]?.importedPublicKeys.includes(publickey)
          ) {
            return { blockchain, publickey, ledger: false };
          } else if (keys[blockchain]?.ledgerPublicKeys.includes(publickey)) {
            _match = { blockchain, publickey, ledger: true };
          }
        }
        return _match;
      })();

      if (!match) throw new Error("key not found");

      let signature: string;

      switch (match.blockchain) {
        case Blockchain.SOLANA:
          if (match.ledger) {
            const tx = new Transaction();
            tx.add(
              new TransactionInstruction({
                programId: new PublicKey(match.publickey),
                keys: [],
                data: Buffer.from(bs58.decode(encodedMessage)),
              })
            );
            tx.feePayer = new PublicKey(match.publickey);
            tx.recentBlockhash = tx.feePayer.toString();
            const blockchainKeyring =
              this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
                Blockchain.SOLANA
              );
            signature = await blockchainKeyring.signTransaction(
              bs58.encode(tx.serializeMessage()),
              match?.publickey
            );
          } else {
            // sign a message with a hot wallet
            signature = await this.solanaSignMessage(
              encodedMessage,
              match.publickey
            );
          }
          break;
        case Blockchain.ETHEREUM:
          signature = await this.solanaSignMessage(
            encodedMessage,
            match.publickey
          );
          break;
      }

      return {
        message: msg,
        encodedMessage,
        signature,
        ...match,
      };
    } catch (err) {
      throw new Error(`unable to sign - ${err.message}`);
    }
  }

  // Method for signing messages from a specific wallet for a specific blockchain
  // without the requirement to initialise a keystore. Used during onboarding.
  async signMessageForWallet(
    blockchain: Blockchain,
    msg: string,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey: string,
    mnemonic?: string
  ) {
    const blockchainKeyring = keyringForBlockchain(blockchain);

    if (mnemonic) {
      blockchainKeyring.initFromMnemonic(mnemonic, derivationPath, [
        accountIndex,
      ]);
    } else {
      if (!publicKey) {
        throw new Error("missing public key");
      }
      blockchainKeyring.initFromLedger([
        {
          path: derivationPath,
          account: accountIndex,
          publicKey,
        },
      ]);
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
        // Call the signTransaction method on Ledger
        return await blockchainKeyring.signTransaction(
          bs58.encode(tx.serializeMessage()),
          publicKey
        );
      }
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
    uuid: string
  ): Promise<string> {
    await this.keyringStore.init(username, password, keyringInit, uuid);

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
    uuid: string
  ): Promise<string> {
    await this.keyringStore.usernameKeyringCreate(username, keyringInit, uuid);
    const walletData = await this.keyringStoreReadAllPubkeyData();
    const preferences = await this.preferencesRead(uuid);
    const xnftPreferences = await this.getXnftPreferences();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED,
      data: {
        user: {
          username,
          uuid,
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
    const { username } = await this.keyringStore.activeUserUpdate(uuid);

    // Get data to push back to the UI.
    const walletData = await this.keyringStoreReadAllPubkeyData();

    // Get preferences to push back to the UI.
    const preferences = await this.preferencesRead(uuid);
    const xnftPreferences = await this.getXnftPreferences();

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
      },
    });

    // Done.
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

    await this.keyringStore.tryUnlock(password);

    if (BACKPACK_FEATURE_USERNAMES && BACKPACK_FEATURE_JWT) {
      // ensure the user has a JSON Web Token stored in their cookies
      try {
        const res = await fetch(`${BACKEND_API_URL}/users/${username}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.status !== 200)
          throw new Error(`failed to authenticate (${username})`);
        const { id, publickeys } = await res.json();
        if (id && publickeys?.length) {
          const signatureBundle = await this.tryToSignMessage(
            JSON.stringify({
              id,
              username,
            }),
            publickeys
          );
          await fetch(`${BACKEND_API_URL}/authenticate`, {
            body: JSON.stringify(signatureBundle),
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (res.status !== 200)
            throw new Error("failed to verify signed message");
        }
      } catch (err) {
        this.keyringStore.lock();
        throw new Error(err.message);
      }
    }

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

  async keyringStoreReadAllPubkeyData(): Promise<any> {
    const activePublicKeys = await this.activeWallets();
    const publicKeys = await this.keyringStoreReadAllPubkeys();
    return {
      activePublicKeys,
      publicKeys,
    };
  }

  // Returns all pubkeys available for signing.
  async keyringStoreReadAllPubkeys(): Promise<any> {
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
      return defaultPreferences([]);
    }
  }

  async activeWalletUpdate(
    newActivePublicKey: string,
    blockchain: Blockchain
  ): Promise<string> {
    const keyring =
      this.keyringStore.activeUsernameKeyring.keyringForBlockchain(blockchain);
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

    return SUCCESS_RESPONSE;
  }

  // Map of blockchain to the active public key for that blockchain.
  async blockchainActiveWallets() {
    return Object.fromEntries(
      (await this.activeWallets()).map((publicKey) => {
        return [
          this.keyringStore.activeUsernameKeyring.blockchainForPublicKey(
            publicKey
          ),
          publicKey,
        ];
      })
    );
  }

  async keyringDeriveWallet(blockchain: Blockchain): Promise<string> {
    const [pubkey, name] = await this.keyringStore.deriveNextKey(blockchain);
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_DERIVED_WALLET,
      data: {
        blockchain,
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

  async keyringKeyDelete(
    blockchain: Blockchain,
    publicKey: string
  ): Promise<string> {
    const keyring =
      this.keyringStore.activeUsernameKeyring.keyringForBlockchain(blockchain);

    // If we're removing the currently active key then we need to update it
    // first.
    if (keyring.getActiveWallet() === publicKey) {
      // Find remaining public keys
      const nextPublicKey = Object.values(keyring.publicKeys())
        .flat()
        .find((k) => k !== keyring.getActiveWallet());
      if (!nextPublicKey) {
        throw new Error("cannot delete last public key");
      }
      // Set the first to be it to be the new active wallet
      keyring.activeWalletUpdate(nextPublicKey);
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
      return { username: "", uuid: "" };
    }
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
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
      data: {
        blockchain,
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

  async keyringAutolockRead(uuid: string): Promise<number> {
    const data = await store.getWalletDataForUser(uuid);
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

  async ledgerImport(
    blockchain: Blockchain,
    dPath: string,
    account: number,
    pubkey: string
  ) {
    await this.keyringStore.ledgerImport(blockchain, dPath, account, pubkey);
    return SUCCESS_RESPONSE;
  }

  validateMnemonic(mnemonic: string): boolean {
    return _validateMnemonic(mnemonic);
  }

  async mnemonicCreate(strength: number): Promise<string> {
    return this.keyringStore.createMnemonic(strength);
  }

  keyringTypeRead(): KeyringType {
    return this.keyringStore.activeUsernameKeyring.hasMnemonic()
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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

  async isApprovedOrigin(origin: string): Promise<boolean> {
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    publicKey?: string
  ): Promise<void> {
    await this.keyringStore.blockchainKeyringAdd(
      blockchain,
      derivationPath,
      accountIndex,
      publicKey
    );
    // Automatically enable the newly added blockchain
    await this.enabledBlockchainsAdd(blockchain);
  }

  /**
   * Return all blockchains that have initialised keyrings, even if they are not
   * enabled.
   */
  async blockchainKeyringsRead(): Promise<Array<Blockchain>> {
    return this.keyringStore.activeUsernameKeyring.blockchainKeyrings();
  }

  /**
   * Enable a blockchain. The blockchain keyring must be initialized prior to this.
   */
  async enabledBlockchainsAdd(blockchain: Blockchain) {
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    if (data.enabledBlockchains.includes(blockchain)) {
      throw new Error("blockchain already enabled");
    }

    // Validate that the keyring is initialised before we enable it. This could
    // be done using `this.blockchainKeyringsRead()` but we need the keyring to
    // create a notification with the active wallet later anyway.
    let keyring: BlockchainKeyring;
    try {
      keyring =
        this.keyringStore.activeUsernameKeyring.keyringForBlockchain(
          blockchain
        );
    } catch (error) {
      throw new Error(`${blockchain} keyring not initialised`);
    }

    const enabledBlockchains = [...data.enabledBlockchains, blockchain];
    await store.setWalletDataForUser(uuid, {
      ...data,
      enabledBlockchains,
    });

    const activeWallet = keyring.getActiveWallet();
    const publicKeyData = await this.keyringStoreReadAllPubkeyData();

    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_BLOCKCHAIN_ENABLED,
      data: {
        blockchain,
        enabledBlockchains,
        activeWallet,
        publicKeyData,
      },
    });
  }

  async enabledBlockchainsRemove(blockchain: Blockchain) {
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    if (!data.enabledBlockchains.includes(blockchain)) {
      throw new Error("blockchain not enabled");
    }
    if (data.enabledBlockchains.length === 1) {
      throw new Error("cannot disable last enabled blockchain");
    }
    const enabledBlockchains = data.enabledBlockchains.filter(
      (b) => b !== blockchain
    );
    await store.setWalletDataForUser(uuid, {
      ...data,
      enabledBlockchains,
    });
    const publicKeyData = await this.keyringStoreReadAllPubkeyData();
    this.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_BLOCKCHAIN_DISABLED,
      data: { blockchain, enabledBlockchains, publicKeyData },
    });
  }

  /**
   * Return all the enabled blockchains.
   */
  async enabledBlockchainsRead(): Promise<Array<Blockchain>> {
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
    const data = await store.getWalletDataForUser(uuid);
    return data.enabledBlockchains;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
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
    const uuid = this.keyringStore.activeUsernameKeyring.uuid;
    return await store.getXnftPreferencesForUser(uuid);
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

  async navigationToDefault(): Promise<string> {
    await store.setNav(defaultNav);
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
