import type {
  Blockchain,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
  WalletDescriptor,
} from "@coral-xyz/common";
import { secureStore } from "@coral-xyz/secure-background/legacyExport";

import { getBlockchainConfig } from "../../blockchain-configs/blockchains";
import { keyringForBlockchain } from "../../keyring";
import type { BlockchainKeyring } from "../../keyring/BlockchainKeyring";
import {
  type BlockchainWalletInit,
  BlockchainWalletType,
} from "../../types/blockchain";
import type { SecureStore, UserKeyringJson } from "../SecureStore";

import type { UserPublicKeys } from "./KeyringStore";

// Holds all keys for a given username.
export class UserKeyring {
  blockchains: Map<string, BlockchainKeyring>;
  username?: string;
  uuid?: string;
  private mnemonic?: string;
  private store: SecureStore;

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor(store: SecureStore) {
    this.blockchains = new Map();
    this.store = store;
  }

  public static async init(
    username: string,
    uuid: string,
    store: SecureStore,
    _keyringInit?:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit
  ): Promise<UserKeyring> {
    const keyring = new UserKeyring(store);
    keyring.uuid = uuid;
    keyring.username = username;

    if (!_keyringInit) {
      return keyring;
    }

    if ("mnemonic" in _keyringInit) {
      if (_keyringInit.mnemonic === true) {
        throw new Error("invalid mnemonic");
      }
      keyring.mnemonic = _keyringInit.mnemonic;
    }

    // Ledger and mnemonic keyring init have signedWalletDescriptors
    if ("signedWalletDescriptors" in _keyringInit) {
      for (const signedWalletDescriptor of _keyringInit.signedWalletDescriptors) {
        const blockchain = signedWalletDescriptor.blockchain;
        // No blockchain keyring, create it, filtering the signed wallet descriptors
        // to only the ones for this blockchain
        await keyring.blockchainKeyringAdd(blockchain, {
          ..._keyringInit,
          signedWalletDescriptors: _keyringInit.signedWalletDescriptors.filter(
            (s) => s.blockchain === blockchain
          ),
        });
      }
    }

    if ("privateKey" in _keyringInit) {
      const blockchainKeyring = keyring.blockchains.get(
        _keyringInit.blockchain
      );
      if (blockchainKeyring) {
        // Blockchain keyring already exists, just add the private key
        await blockchainKeyring.importSecretKey(_keyringInit.privateKey, "New");
      } else {
        // No blockchain keyring, create it
        await keyring.blockchainKeyringAdd(
          _keyringInit.blockchain,
          _keyringInit
        );
      }
    }

    return keyring;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // State selectors.
  ///////////////////////////////////////////////////////////////////////////////

  public hasMnemonic(): boolean {
    return !!this.mnemonic;
  }

  /**
   * Return all the blockchains that have an initialised keyring even if they
   * are not enabled.
   */
  public blockchainKeyrings(): Array<Blockchain> {
    return [...this.blockchains.keys()].map((b) => b as Blockchain);
  }

  public async publicKeys(): Promise<UserPublicKeys> {
    const entries = this.blockchainKeyrings().map((blockchain) => {
      const keyring = this.keyringForBlockchain(blockchain);
      return [blockchain, keyring.publicKeys()];
    });
    return Object.fromEntries(entries);
  }

  /**
   * Returns the keyring for a given blockchain.
   */
  public keyringForBlockchain(blockchain: Blockchain): BlockchainKeyring {
    const keyring = this.blockchains.get(blockchain);
    if (keyring) {
      return keyring;
    }
    throw new Error(`no keyring for ${blockchain}`);
  }

  /**
   * Returns the keyring for a given public key.
   */
  public keyringForPublicKey(publicKey: string): BlockchainKeyring | null {
    for (const keyring of this.blockchains.values()) {
      if (keyring.hasPublicKey(publicKey)) {
        return keyring;
      }
    }
    return null;
  }

  /**
   * Returns the blockchain for a given public key.
   */
  public blockchainForPublicKey(publicKey: string): Blockchain {
    for (const [blockchain, keyring] of this.blockchains) {
      if (keyring.hasPublicKey(publicKey)) {
        return blockchain as Blockchain;
      }
    }
    throw new Error(`no blockchain for ${publicKey}`);
  }

  public async _activeWalletsByBlockchain(): Promise<
    Partial<Record<Blockchain, string>>
  > {
    const activeWallets: Partial<Record<Blockchain, string>> = {};
    this.blockchainKeyrings().forEach((blockchain) => {
      const activeWallet =
        this.keyringForBlockchain(blockchain).getActiveWallet();
      if (activeWallet) {
        activeWallets[blockchain] = activeWallet;
      }
    });

    return activeWallets;
  }

  public async activeWallets(): Promise<string[]> {
    return Object.values(await this._activeWalletsByBlockchain());
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Actions.
  ///////////////////////////////////////////////////////////////////////////////

  public async walletInit(blockchainWalletInit: BlockchainWalletInit): Promise<{
    publicKey: string;
    blockchain: Blockchain;
    name: string;
  }> {
    const blockchain = blockchainWalletInit.blockchain;
    let keyring = this.blockchains.get(blockchain);

    // if keyring doesnt exist, create it.
    if (!keyring) {
      keyring = keyringForBlockchain(blockchain, this.store);
      await keyring.initEmpty();
      this.blockchains.set(blockchain, keyring);
    }

    switch (blockchainWalletInit.type) {
      case BlockchainWalletType.MNEMONIC: {
        if (blockchainWalletInit.mnemonic) {
          await this.setMnemonic(blockchainWalletInit.mnemonic);
        }
        return {
          ...(await this.addDerivationPath(
            blockchain,
            blockchainWalletInit.derivationPath
          )),
          blockchain,
        };
      }
      case BlockchainWalletType.PRIVATEKEY: {
        const [publicKey, name] = await this.importSecretKey(
          blockchain,
          blockchainWalletInit.privateKey,
          blockchainWalletInit.name
        );
        return { publicKey, name, blockchain };
      }
      case BlockchainWalletType.HARDWARE: {
        return {
          ...(await this.ledgerImport({
            ...blockchainWalletInit,
          })),
          blockchain,
        };
      }
      case BlockchainWalletType.MNEMONIC_IMPORT: {
        const [publicKey, name] = await keyring.importSecretFromMnemonic(
          blockchainWalletInit.mnemonic,
          blockchainWalletInit.derivationPath,
          blockchainWalletInit.name
        );
        return { publicKey, name, blockchain };
      }
      case BlockchainWalletType.MNEMONIC_NEXT: {
        if (!keyring.hasHdKeyring()) {
          if (!this.mnemonic) {
            throw new Error("No mnemonic found to derive from");
          }
          const blockchainConfig = getBlockchainConfig(blockchain);
          const derivationPattern =
            blockchainConfig.DerivationPathOptions[0].pattern;
          const [wallet] = await keyring.initHdKeyring(this.mnemonic, [
            derivationPattern.replace(/x/g, "0"),
          ]);
          return {
            publicKey: wallet[0],
            name: wallet[1],
            blockchain,
          };
        } else {
          const { publicKey, name } = await keyring.deriveNextKey();
          return { publicKey, name, blockchain };
        }
      }
    }
  }

  public async blockchainKeyringAdd(
    blockchain: Blockchain,
    keyringInit: MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit
  ): Promise<void> {
    const keyring = keyringForBlockchain(blockchain as Blockchain, this.store);
    if ("mnemonic" in keyringInit) {
      if (keyringInit.mnemonic === true) {
        keyringInit.mnemonic = this.mnemonic!;
      }
    }
    await keyring.init(keyringInit);
    this.blockchains.set(blockchain, keyring);
  }

  public async blockchainKeyringRemove(blockchain: Blockchain): Promise<void> {
    const user = await this.store.getActiveUser();
    this.blockchains.delete(blockchain);
    await this.store.setUserPlatform(user.uuid, blockchain, null);
  }

  public async importSecretKey(
    blockchain: Blockchain,
    secretKey: string,
    name?: string
  ): Promise<[string, string]> {
    const keyring = this.keyringForBlockchain(blockchain);
    const [publicKey, _name] = await keyring.importSecretKey(secretKey, name);
    return [publicKey, _name];
  }

  /**
   * Update the active public key for the given blockchain.
   */
  public async activeWalletUpdate(
    newActivePublicKey: string,
    blockchain: Blockchain
  ) {
    const keyring = this.keyringForBlockchain(blockchain);
    await secureStore.setUserActivePublicKey(
      this.uuid!,
      blockchain,
      newActivePublicKey
    );
    await keyring._activeWalletUpdate(newActivePublicKey);
  }

  public nextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): { derivationPath: any; offset: number } {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else {
      return blockchainKeyring.nextDerivationPath(keyring);
    }
  }

  public async addDerivationPath(
    blockchain: Blockchain,
    derivationPath: string
  ): Promise<{ publicKey: string; name: string }> {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else if (!blockchainKeyring.hasHdKeyring()) {
      // Hd keyring not initialised, ibitialise it if possible
      if (!this.mnemonic) {
        throw new Error("hd keyring not initialised");
      }
      const accounts = await blockchainKeyring.initHdKeyring(this.mnemonic, [
        derivationPath,
      ]);
      return {
        publicKey: accounts[0][0],
        name: accounts[0][1],
      };
    } else {
      return blockchainKeyring.addDerivationPath(derivationPath);
    }
  }

  /**
   * Get the next derived key for the mnemonic.
   */
  public async deriveNextKey(
    blockchain: Blockchain
  ): Promise<{ publicKey: string; derivationPath: string; name: string }> {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else {
      return await blockchainKeyring.deriveNextKey();
    }
  }

  public exportSecretKey(publicKey: string): string {
    const keyring = this.keyringForPublicKey(publicKey);
    if (!keyring) {
      throw new Error(`no keyring for ${publicKey}`);
    }
    return keyring.exportSecretKey(publicKey);
  }

  public exportMnemonic(): string {
    if (!this.mnemonic) {
      throw new Error("keyring does not have a mnemonic");
    }
    return this.mnemonic;
  }

  public async setMnemonic(mnemonic: string) {
    if (this.mnemonic && this.mnemonic !== mnemonic) {
      throw new Error("keyring already has a mnemonic set");
    }

    this.mnemonic = mnemonic;
    try {
      if (this.uuid) {
        await this.store.setUser(this.uuid, { hasMnemonic: true });
      }
    } catch {
      null;
    }
  }

  public async ledgerImport(walletDescriptor: WalletDescriptor): Promise<{
    publicKey: string;
    name: string;
  }> {
    if (!this.uuid) {
      throw new Error("Keyring not initialized");
    }
    const blockchainKeyring = this.blockchains.get(walletDescriptor.blockchain);
    const ledgerKeyring = blockchainKeyring!.ledgerKeyring!;
    await ledgerKeyring.add(walletDescriptor);
    const name = this.store.defaultKeyname.defaultLedger(
      ledgerKeyring.publicKeys().length
    );
    await this.store.setUserPublicKey(
      this.uuid,
      walletDescriptor.blockchain,
      walletDescriptor.publicKey,
      {
        name,
        isCold: true,
        type: "hardware",
      }
    );

    return {
      name,
      publicKey: walletDescriptor.publicKey,
    };
  }

  public async keyDelete(blockchain: Blockchain, pubkey: string) {
    if (!this.uuid) {
      throw new Error("Keyring not initialized");
    }
    await this.store.setUserPublicKey(this.uuid, blockchain, pubkey, null);
    const blockchainKeyring = this.blockchains.get(blockchain);
    await blockchainKeyring!.keyDelete(blockchain, pubkey);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Serialization.
  ///////////////////////////////////////////////////////////////////////////////

  public toJson(): UserKeyringJson {
    // toJson on all the keyrings
    const blockchains = Object.fromEntries(
      [...this.blockchains].map(([k, v]) => [k, v.toJson()])
    );
    if (this.uuid === undefined) {
      throw new Error("uuid not found");
    }
    if (this.username === undefined) {
      throw new Error("username not found");
    }

    return {
      uuid: this.uuid,
      username: this.username,
      mnemonic: this.mnemonic,
      blockchains,
    };
  }

  public static fromJson(
    json: UserKeyringJson,
    store: SecureStore
  ): UserKeyring {
    const { uuid, username, mnemonic, blockchains } = json;

    const u = new UserKeyring(store);
    u.uuid = uuid;
    u.username = username;
    u.mnemonic = mnemonic;
    u.blockchains = new Map(
      Object.entries(blockchains).map(([blockchain, obj]) => {
        const blockchainKeyring = keyringForBlockchain(
          blockchain as Blockchain,
          store
        );
        blockchainKeyring.fromJson(obj);
        return [blockchain, blockchainKeyring];
      })
    );
    return u;
  }
}
