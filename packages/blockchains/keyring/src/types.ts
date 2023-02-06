import type {
  HdKeyringJson,
  KeyringJson,
  KeystoneKeyringJson,
  LedgerKeyringJson,
  UR,
  WalletDescriptor,
} from "@coral-xyz/common";

import type { KeystoneKeyringBase } from './keystone';
import type { LedgerKeyringBase } from "./ledger";

export type {
  HdKeyringJson,
  KeyringJson,
  LedgerKeyringJson,
} from "@coral-xyz/common";

export interface KeyringFactory {
  init(secretKeys: Array<string>): Keyring;
  fromJson(payload: KeyringJson): Keyring;
}

export interface Keyring {
  publicKeys(): Array<string>;
  deletePublicKey(publicKey: string): void;
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  exportSecretKey(address: string): string | null;
  importSecretKey(secretKey: string): string;
  toJson(): any;
}

//
// HD keyring types
//
export interface HdKeyringFactory {
  init(mnemonic: string, derivationPaths: Array<string>): HdKeyring;
  fromJson(obj: HdKeyringJson): HdKeyring;
}

export interface HdKeyring extends Keyring {
  readonly mnemonic: string;
  addDerivationPath(derivationPath: string): string;
  nextDerivationPath(): string;
  deriveNextKey(): {
    publicKey: string;
    derivationPath: string;
  };
}

//
// Ledger keyring types
//
export interface LedgerKeyringFactory {
  init(walletDescriptors: Array<WalletDescriptor>): LedgerKeyring;
  fromJson(obj: LedgerKeyringJson): LedgerKeyring;
}

export interface LedgerKeyring extends LedgerKeyringBase {
  nextDerivationPath(): string;
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  add(walletDescriptor: WalletDescriptor): Promise<void>;
}

//
// Keystone keyring types
//

export interface KeystoneKeyringFactory {
  fromAccounts(accounts: Array<ImportedDerivationPath>): KeystoneKeyring;
  fromUR(ur: UR): KeystoneKeyring;
  fromJson(obj: KeystoneKeyringJson): KeystoneKeyring;
}

export interface KeystoneKeyring extends Keyring {
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  keystoneImport(ur: UR): Promise<void>;
  toJson(): KeystoneKeyringJson;
  getAccounts(): ImportedDerivationPath[];
}

//
// Keystone keyring types
//

export interface KeystoneKeyringFactory {
  fromAccounts(accounts: Array<ImportedDerivationPath>): KeystoneKeyring;
  fromUR(ur: UR): Promise<KeystoneKeyring>;
  fromJson(obj: KeystoneKeyringJson): KeystoneKeyring;
}

export interface KeystoneKeyring extends KeystoneKeyringBase {
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  keystoneImport(ur: UR, pubKey?: string): Promise<void>;
  toJson(): KeystoneKeyringJson;
  getAccounts(): ImportedDerivationPath[];
  onPlay(fn: (ur: UR) => Promise<void>): void;
  onRead(fn: () => Promise<UR>): void;
}
