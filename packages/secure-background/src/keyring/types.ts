import type { WalletDescriptor } from "@coral-xyz/common";

export type BlockchainKeyringJson = {
  hdKeyring?: HdKeyringJson;
  importedKeyring: KeyringJson;
  ledgerKeyring: LedgerKeyringJson;
  activeWallet: string;
  deletedWallets: Array<string>;
};

export type KeyringJson = {
  secretKeys: Array<string>;
};

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  derivationPaths: Array<string>;
  accountIndex?: number;
  walletIndex?: number;
};

export type LedgerKeyringJson = {
  walletDescriptors: Array<WalletDescriptor>;
};

export interface KeyringFactory {
  init(secretKeys: Array<string>): Keyring;
  fromJson(payload: KeyringJson): Keyring;
}

export interface KeyringBase {
  publicKeys(): Array<string>;
  deletePublicKey(publicKey: string): void;
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  exportSecretKey(address: string): string | null;
  importSecretKey(secretKey: string, publicKey: string): string;
  seedToSecretKey(seed: Buffer, derivationPath: string): string;
  secretKeyToPublicKeys(
    secretKey: string
  ): { type: string; publicKey: string }[];
}

export interface Keyring extends KeyringBase {
  toJson(): KeyringJson;
}

//
// HD keyring types
//
export interface HdKeyringFactory {
  init(mnemonic: string, derivationPaths: Array<string>): HdKeyring;
  fromJson(obj: HdKeyringJson): HdKeyring;
}

export interface HdKeyring extends KeyringBase {
  readonly mnemonic: string;
  addDerivationPath(derivationPath: string, publicKey: string): string;
  toJson(): HdKeyringJson;
}

//
// Ledger keyring types
//
export interface LedgerKeyringFactory {
  init(walletDescriptors: Array<WalletDescriptor>): LedgerKeyring;
  fromJson(obj: LedgerKeyringJson): LedgerKeyring;
}

export interface LedgerKeyring extends KeyringBase {
  prepareSignTransaction(request: { publicKey: string; tx: string }): Promise<{
    signableTx: string;
    derivationPath: string;
  }>;
  prepareSignMessage(request: { publicKey: string; message: string }): Promise<{
    signableMessage: string;
    derivationPath: string;
  }>;
  add(walletDescriptor: WalletDescriptor): Promise<void>;
  toJson(): LedgerKeyringJson;
}

export type AnyKeyring = Keyring | HdKeyring | LedgerKeyring;
