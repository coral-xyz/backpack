import type {
  HdKeyringJson,
  KeyringJson,
  LedgerKeyringJson,
  WalletDescriptor,
} from "@coral-xyz/common";

export type {
  HdKeyringJson,
  KeyringJson,
  LedgerKeyringJson,
} from "@coral-xyz/common";

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
  importSecretKey(secretKey: string): string;
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
  addDerivationPath(derivationPath: string): string;
  nextDerivationPath(): string;
  deriveNextKey(): {
    publicKey: string;
    derivationPath: string;
  };
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
  nextDerivationPath(): string;
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  add(walletDescriptor: WalletDescriptor): Promise<void>;
  toJson(): LedgerKeyringJson;
}

export type AnyKeyring = Keyring | HdKeyring | LedgerKeyring;
