import type {
  Blockchain,
  BlockchainKeyringJson,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
} from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";
import { decode } from "bs58";

import type { SecureStore } from "../store/SecureStore";

// import { setIsCold } from "../store/isCold";
// import { DefaultKeyname, setKeyname } from "../store/keyname";
import type {
  AnyKeyring,
  HdKeyring,
  HdKeyringFactory,
  Keyring,
  KeyringFactory,
  LedgerKeyring,
  LedgerKeyringFactory,
} from "./types";

const logger = getLogger("background/backend/keyring");

// Represents key data for a single blockchain network, e.g., solana or ethereum.
export class BlockchainKeyring {
  private store: SecureStore;
  private hdKeyringFactory: HdKeyringFactory;
  private keyringFactory: KeyringFactory;
  private ledgerKeyringFactory: LedgerKeyringFactory;
  private hdKeyring?: HdKeyring;
  private importedKeyring?: Keyring;
  public ledgerKeyring?: LedgerKeyring;
  private activeWallet?: string;
  private deletedWallets?: Array<string>;
  private blockchain: Blockchain;

  constructor(
    blockchain: Blockchain,
    store: SecureStore,
    hdKeyringFactory: HdKeyringFactory,
    keyringFactory: KeyringFactory,
    ledgerKeyringFactory: LedgerKeyringFactory
  ) {
    this.store = store;
    this.hdKeyringFactory = hdKeyringFactory;
    this.keyringFactory = keyringFactory;
    this.ledgerKeyringFactory = ledgerKeyringFactory;
    this.blockchain = blockchain;
  }

  public publicKeys(): {
    hdPublicKeys: Array<string>;
    importedPublicKeys: Array<string>;
    ledgerPublicKeys: Array<string>;
  } {
    const hdPublicKeys = this.hdKeyring ? this.hdKeyring.publicKeys() : [];
    const importedPublicKeys = this.importedKeyring
      ? this.importedKeyring.publicKeys()
      : [];
    const ledgerPublicKeys = this.ledgerKeyring
      ? this.ledgerKeyring.publicKeys()
      : [];
    return {
      hdPublicKeys,
      importedPublicKeys,
      ledgerPublicKeys,
    };
  }

  public async initEmpty() {
    if (Object.values(this.publicKeys()).flat().length > 0) {
      throw new Error("keyring already initialised");
    }

    this.ledgerKeyring = this.ledgerKeyringFactory.init([]);
    this.importedKeyring = this.keyringFactory.init([]);
  }

  /**
   * Set up a new blockchain keyring.
   */
  public async init(
    keyringInit: MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit
  ): Promise<Array<[string, string]>> {
    if (Object.values(this.publicKeys()).flat().length > 0) {
      throw new Error("keyring already initialised");
    }
    let newAccounts: Array<[string, string]> = [];
    const user = await this.store.getActiveUser();
    if ("mnemonic" in keyringInit) {
      // Don't accept `true` for mnemonic initialisation
      if (typeof keyringInit.mnemonic !== "string") {
        throw new Error("invalid mnemonic");
      }

      newAccounts = await this.initHdKeyring(
        keyringInit.mnemonic,
        keyringInit.signedWalletDescriptors.map((s) => s.derivationPath)
      );
      this.ledgerKeyring = this.ledgerKeyringFactory.init([]);
      this.importedKeyring = this.keyringFactory.init([]);
    } else if ("privateKey" in keyringInit) {
      // Init using private key
      this.ledgerKeyring = this.ledgerKeyringFactory.init([]);
      this.importedKeyring = this.keyringFactory.init([keyringInit.privateKey]);
      const name = this.store.defaultKeyname.defaultImported(1);
      await this.store.setUserPublicKey(
        user.uuid,
        keyringInit.blockchain,
        keyringInit.publicKey,
        {
          name,
          isCold: false,
          type: "imported",
        }
      );

      newAccounts = [[name, keyringInit.publicKey]];
    } else {
      // Init using ledger
      this.ledgerKeyring = this.ledgerKeyringFactory.init(
        keyringInit.signedWalletDescriptors
      );
      this.importedKeyring = this.keyringFactory.init([]);
      for (const [
        index,
        walletDescriptor,
      ] of keyringInit.signedWalletDescriptors.entries()) {
        const name = this.store.defaultKeyname.defaultLedger(index + 1);
        await this.store.setUserPublicKey(
          user.uuid,
          walletDescriptor.blockchain,
          walletDescriptor.publicKey,
          {
            name,
            isCold: true,
            type: "hardware",
          }
        );

        newAccounts.push([walletDescriptor.publicKey, name]);
      }
    }
    this.activeWallet = Object.values(this.publicKeys()).flat()[0];
    this.deletedWallets = [];
    return newAccounts;
  }

  /**
   * Utility method to init a hd keyring on a blockchain keyring.
   * This is used when initialising by mnemonic, but it is also used when the
   * user initialised with a private key or ledger and they later want to add
   * a mnemonic.
   */
  public async initHdKeyring(
    mnemonic: string,
    derivationPaths: Array<string>
  ): Promise<Array<[string, string]>> {
    const activeUser = await this.store.getActiveUser();
    // Initialize keyrings.
    this.hdKeyring = this.hdKeyringFactory.init(mnemonic, derivationPaths);
    this.activeWallet = this.hdKeyring!.publicKeys()[0];
    // Persist a given name for this wallet.
    const newAccounts: Array<[string, string]> = [];
    for (const [index, publicKey] of this.hdKeyring.publicKeys().entries()) {
      const name = this.store.defaultKeyname.defaultDerived(index + 1);
      await this.store.setUserPublicKey(
        activeUser.uuid,
        this.blockchain,
        publicKey,
        {
          name,
          isCold: false,
          type: "derived",
        }
      );
      newAccounts.push([publicKey, name]);
    }
    return newAccounts;
  }

  /**
   * Export a private key for the given public key. If the public key is found
   * on the hd keyring it exports the secret key from there, otherwise it looks
   * on the imported keyring.
   */
  public exportSecretKey(pubkey: string): string {
    let sk = this.hdKeyring?.exportSecretKey(pubkey);
    if (sk) {
      return sk;
    }
    sk = this.importedKeyring?.exportSecretKey(pubkey);
    if (sk) {
      return sk;
    }
    throw new Error(`unable to find keypair for ${pubkey}`);
  }

  public mnemonic(): string {
    return this.hdKeyring!.mnemonic;
  }

  public nextDerivationPath(keyring: "hd" | "ledger"): {
    derivationPath: any;
    offset: number;
  } {
    if (keyring === "hd") {
      return this.hdKeyring!.nextDerivationPath();
    } else {
      return this.ledgerKeyring!.nextDerivationPath();
    }
  }

  public async deriveNextKey(): Promise<{
    publicKey: string;
    derivationPath: string;
    name: string;
  }> {
    const activeUser = await this.store.getActiveUser();
    const { publicKey, derivationPath } = this.hdKeyring!.deriveNextKey();
    // Save a default name.
    const name = this.store.defaultKeyname.defaultDerived(
      this.hdKeyring!.publicKeys().length
    );
    await this.store.setUserPublicKey(
      activeUser.uuid,
      this.blockchain,
      publicKey,
      {
        name,
        isCold: false,
        type: "derived",
      }
    );
    return { publicKey, derivationPath, name };
  }

  public async addDerivationPath(
    derivationPath: string
  ): Promise<{ publicKey: string; name: string }> {
    if (!this.hdKeyring) {
      throw new Error("hd keyring not initialised");
    }

    const user = await this.store.getActiveUser();
    const publicKey = this.hdKeyring.addDerivationPath(derivationPath);

    // Save a default name.
    const name = this.store.defaultKeyname.defaultDerived(
      this.hdKeyring.publicKeys().length
    );
    await this.store.setUserPublicKey(user.uuid, this.blockchain, publicKey, {
      name,
      isCold: false,
      type: "derived",
    });
    // await this.store.setKeyname(publicKey, name, this.blockchain);

    return {
      publicKey,
      name,
    };
  }

  public async importSecretKey(
    secretKey: string,
    name?: string
  ): Promise<[string, string]> {
    const pubkey = this.importedKeyring!.importSecretKey(secretKey).toString();
    if (!name || name.length === 0) {
      name = this.store.defaultKeyname.defaultImported(
        this.importedKeyring!.publicKeys().length
      );
    }
    const user = await this.store.getActiveUser();

    await this.store.setUserPublicKey(user.uuid, this.blockchain, pubkey, {
      name,
      isCold: false,
      type: "imported",
    });
    // await this.store.setKeyname(pubkey, name, this.blockchain);
    return [pubkey, name];
  }

  public async importSecretFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    name?: string
  ): Promise<[string, string]> {
    const secretKey = this.importedKeyring!.mnemonicToSecretKey(
      mnemonic,
      derivationPath
    );
    return this.importSecretKey(secretKey, name);
  }

  public getActiveWallet(): string | undefined {
    return this.activeWallet;
  }

  public async _activeWalletUpdate(newWallet: string) {
    this.activeWallet = newWallet;
  }

  public async keyDelete(blockchain: Blockchain, publicKey: string) {
    const user = await this.store.getActiveUser();
    const keyring = this.getKeyring(publicKey);
    if (!keyring) {
      logger.error(
        `unable to find key to delete in keyring store: ${publicKey}`
      );
      throw new Error("public key not found");
    }
    keyring.deletePublicKey(publicKey);
    await this.store.setUserPublicKey(user.uuid, blockchain, publicKey, null);
  }

  public toJson(): BlockchainKeyringJson {
    if (!this.importedKeyring || !this.ledgerKeyring) {
      throw new Error("blockchain keyring is locked");
    }
    return {
      hdKeyring: this.hdKeyring ? this.hdKeyring.toJson() : undefined,
      importedKeyring: this.importedKeyring.toJson(),
      ledgerKeyring: this.ledgerKeyring.toJson(),
      activeWallet: this.activeWallet!,
      deletedWallets: this.deletedWallets!,
    };
  }

  public fromJson(json: BlockchainKeyringJson): void {
    const {
      hdKeyring,
      importedKeyring,
      ledgerKeyring,
      activeWallet,
      deletedWallets,
    } = json;
    this.hdKeyring = hdKeyring
      ? this.hdKeyringFactory.fromJson(hdKeyring)
      : undefined;
    this.importedKeyring = this.keyringFactory.fromJson(importedKeyring);
    this.ledgerKeyring = this.ledgerKeyringFactory.fromJson(ledgerKeyring);
    this.activeWallet = activeWallet;
    this.deletedWallets = deletedWallets;
  }

  //
  // For Solana txMsg is a Message, i.e. not a full transaction.
  // Ref https://docs.solana.com/developing/programming-model/transactions#message-format
  // For Ethereum txMsg is the full transaction, base58 encoded to keep the argument types same.
  //
  public async signTransaction(
    txMsg: string,
    walletAddress: string
  ): Promise<string> {
    const keyring = this.getKeyring(walletAddress);
    const msg = Buffer.from(decode(txMsg));
    return keyring.signTransaction(msg, walletAddress);
  }

  public async signMessage(
    msg: string,
    walletAddress: string
  ): Promise<string> {
    const keyring = this.getKeyring(walletAddress);
    const msgBuffer = Buffer.from(decode(msg));

    return keyring.signMessage(msgBuffer, walletAddress);
  }

  private getKeyring(publicKey: string): AnyKeyring {
    for (const keyring of [
      this.hdKeyring,
      this.importedKeyring,
      this.ledgerKeyring,
    ]) {
      if (keyring && keyring.publicKeys().find((k) => k === publicKey)) {
        return keyring;
      }
    }
    throw new Error("no keyring for public key");
  }

  public hasPublicKey(publicKey: string): boolean {
    try {
      this.getKeyring(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  public hasHdKeyring(): boolean {
    return !!this.hdKeyring;
  }
}
