import { DerivationPath } from "./crypto";

export * from "./solana";
export * from "./ethereum";

export type KeyringJson = {
  keypairs: Array<string>;
};

export interface KeyringFactory {
  fromJson(payload: KeyringJson): Keyring;
  fromSecretKeys(secretKeys: Array<string>): Keyring;
}

export interface Keyring {
  publicKeys(): Array<string>;
  signTransaction(tx: Buffer, address: string): string;
  exportSecretKey(address: string): string | null;
  importSecretKey(secretKey: string): string;
  toJson(): KeyringJson;
}

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  numberOfAccounts: number;
  derivationPath: DerivationPath;
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
  toJson(): any;
}
