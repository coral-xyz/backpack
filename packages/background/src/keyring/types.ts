import type { DerivationPath } from "@200ms/common";

export type KeyringJson = {
  keypairs: Array<string>;
};

export interface KeyringFactory {
  fromJson(payload: KeyringJson): Keyring;
  fromSecretKeys(secretKeys: Array<string>): Keyring;
}

export interface Keyring {
  publicKeys(): Array<string>;
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  exportSecretKey(address: string): string | null;
  importSecretKey(secretKey: string): string;
  toJson(): any;
}

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  numberOfAccounts: number;
  derivationPath: DerivationPath;
};

export type LedgerKeyringJson = {
  derivationPaths: Array<ImportedDerivationPath>;
};

export interface HdKeyringFactory {
  fromMnemonic(mnemonic: string, derivationPath?: DerivationPath): HdKeyring;
  generate(): HdKeyring;
  fromJson(obj: HdKeyringJson): HdKeyring;
}

export interface HdKeyring extends Keyring {
  readonly mnemonic: string;
  deriveNext(): [string, number];
  getPublicKey(accountIndex: number): string;
}

export type LedgerKeyring = Keyring;

export type ImportedDerivationPath = {
  path: string;
  account: number;
  publicKey: string;
};
