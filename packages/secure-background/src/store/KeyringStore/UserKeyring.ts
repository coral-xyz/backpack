import type {
  Blockchain,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
  WalletDescriptor,
} from "@coral-xyz/common";

import { keyringForBlockchain } from "../../keyring";
import type { BlockchainKeyring } from "../../keyring/BlockchainKeyring";
import {
  type BlockchainWalletInit,
  BlockchainWalletInitType,
} from "../../types/blockchain";
import type { UserPublicKeys } from "../../types/keyring";
import type { SecureStore, UserKeyringJson } from "../SecureStore";

// Holds all keys for a given username.
export class UserKeyring {
  public blockchains: Map<string, BlockchainKeyring>;

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor(
    public uuid: string,
    private store: SecureStore,
    private username?: string,
    private mnemonic?: string
  ) {
    this.blockchains = new Map();
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

  public publicKeys(): UserPublicKeys {
    const entries = this.blockchainKeyrings().map((blockchain) => {
      const keyring = this.keyringForBlockchain(blockchain);
      return [blockchain, keyring.publicKeys()];
    });
    return Object.fromEntries(entries);
  }

  public hasPublicKey(blockchain: Blockchain, publicKey: string): boolean {
    const keyring = this.blockchains.get(blockchain);
    return !!keyring?.hasPublicKey(publicKey);
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
      case BlockchainWalletInitType.MNEMONIC: {
        if (blockchainWalletInit.mnemonic) {
          await this.setMnemonic(blockchainWalletInit.mnemonic);
        }
        return {
          ...(await this.addDerivationPath(
            blockchain,
            blockchainWalletInit.derivationPath,
            blockchainWalletInit.publicKey
          )),
          blockchain,
        };
      }
      case BlockchainWalletInitType.PRIVATEKEY: {
        const [publicKey, name] = await this.importSecretKey(
          blockchain,
          blockchainWalletInit.privateKey,
          blockchainWalletInit.publicKey,
          blockchainWalletInit.name
        );
        return { publicKey, name, blockchain };
      }
      case BlockchainWalletInitType.HARDWARE: {
        return {
          ...(await this.ledgerImport({
            ...blockchainWalletInit,
          })),
          blockchain,
        };
      }
      case BlockchainWalletInitType.PRIVATEKEY_DERIVED: {
        const [publicKey, name] = await keyring.importSecretFromMnemonic(
          this.uuid,
          blockchainWalletInit.mnemonic,
          blockchainWalletInit.derivationPath,
          blockchainWalletInit.publicKey,
          blockchainWalletInit.name
        );
        return { publicKey, name, blockchain };
      }
    }
  }

  public async blockchainKeyringRemove(blockchain: Blockchain): Promise<void> {
    const user = await this.store.getActiveUser();
    this.blockchains.delete(blockchain);
    await this.store.setUserPlatform(user.uuid, blockchain, null);
  }

  private async importSecretKey(
    blockchain: Blockchain,
    secretKey: string,
    publicKey: string,
    name?: string
  ): Promise<[string, string]> {
    const keyring = this.keyringForBlockchain(blockchain);
    return await keyring.importSecretKey(this.uuid, secretKey, publicKey, name);
  }

  /**
   * Update the active public key for the given blockchain.
   */
  public async activeWalletUpdate(
    newActivePublicKey: string,
    blockchain: Blockchain
  ) {
    const keyring = this.keyringForBlockchain(blockchain);
    await this.store.setUserActivePublicKey(
      this.uuid,
      blockchain,
      newActivePublicKey
    );
    await keyring._activeWalletUpdate(newActivePublicKey);
  }

  private async addDerivationPath(
    blockchain: Blockchain,
    derivationPath: string,
    publicKey: string
  ): Promise<{ publicKey: string; name: string }> {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    }
    if (!blockchainKeyring.hasHdKeyring()) {
      // Hd keyring not initialised, ibitialise it if possible
      if (!this.mnemonic) {
        throw new Error("hd keyring not initialised");
      }
      await blockchainKeyring.initHdKeyring(this.uuid, this.mnemonic, []);
    }
    return blockchainKeyring.addDerivationPath(
      this.uuid,
      derivationPath,
      publicKey
    );
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
      await this.store.setUser(this.uuid, { hasMnemonic: true });
    } catch {
      null;
    }
  }

  private async ledgerImport(walletDescriptor: WalletDescriptor): Promise<{
    publicKey: string;
    name: string;
  }> {
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

  public async keyDelete({
    blockchain,
    publicKey,
  }: {
    blockchain: Blockchain;
    publicKey: string;
  }) {
    const blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error(
        `Unable to delete publicKey: Keyring for Blockchain ${blockchain} not found.`
      );
    }
    await blockchainKeyring.keyDelete(publicKey);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Serialization.
  ///////////////////////////////////////////////////////////////////////////////

  public toJson(): UserKeyringJson {
    // toJson on all the keyrings
    const blockchains = Object.fromEntries(
      [...this.blockchains].map(([k, v]) => [k, v.toJson()])
    );

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

    const u = new UserKeyring(uuid, store, username, mnemonic);
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
