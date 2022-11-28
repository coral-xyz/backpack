import type { DerivationPath } from "@coral-xyz/common";

import type { LedgerKeyringBase } from "./ledger";

export type KeyringJson = {
  secretKeys: Array<string>;
};

export interface KeyringFactory {
  fromJson(payload: KeyringJson): Keyring;
  fromSecretKeys(secretKeys: Array<string>): Keyring;
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

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  accountIndices: Array<number>;
  derivationPath: DerivationPath;
};

export interface HdKeyringFactory {
  fromMnemonic(
    mnemonic: string,
    derivationPath?: DerivationPath,
    accountIndices?: Array<number>
  ): HdKeyring;
  fromJson(obj: HdKeyringJson): HdKeyring;
}

export interface HdKeyring extends Keyring {
  readonly mnemonic: string;
  deriveNext(): [string, number];
  getPublicKey(accountIndex: number): string;
}

//
// Ledger keyring types
//

export type LedgerKeyringJson = {
  derivationPaths: Array<ImportedDerivationPath>;
};

export interface LedgerKeyringFactory {
  fromAccounts(accounts: Array<ImportedDerivationPath>): LedgerKeyring;
  fromJson(obj: LedgerKeyringJson): LedgerKeyring;
}

export interface LedgerKeyring extends LedgerKeyringBase {
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  keyCount(): number;
  ledgerImport(path: string, account: number, publicKey: string): Promise<void>;
}

export type ImportedDerivationPath = {
  path: string;
  account: number;
  publicKey: string;
};
