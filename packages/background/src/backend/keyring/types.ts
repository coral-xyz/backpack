import type { DerivationPath } from "@coral-xyz/common";

export type KeyringJson = {
  secretKeys: Array<string>;
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
  deleteKeyIfNeeded(pubkey: string): number;
  toJson(): any;
}

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  accountIndices: Array<number>;
  derivationPath: DerivationPath;
};

export type LedgerKeyringJson = {
  derivationPaths: Array<ImportedDerivationPath>;
};

export interface HdKeyringFactory {
  fromMnemonic(
    mnemonic: string,
    derivationPath?: DerivationPath,
    accountIndices?: Array<number>
  ): HdKeyring;
  generate(strength: number): HdKeyring;
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
