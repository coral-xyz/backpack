import type {
  DerivationPath,
  HdKeyringJson,
  ImportedDerivationPath,
  KeyringJson,
  LedgerKeyringJson,
} from "@coral-xyz/common";

import type { LedgerKeyringBase } from "./ledger";

export type {
  HdKeyringJson,
  ImportedDerivationPath,
  KeyringJson,
  LedgerKeyringJson,
} from "@coral-xyz/common";

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
  readonly derivationPath: string;
  importAccountIndex(accountIndex?: number): [string, number];
  getPublicKey(accountIndex: number): string;
}

//
// Ledger keyring types
//

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
