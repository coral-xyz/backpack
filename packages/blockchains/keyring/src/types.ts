import type {
  HdKeyringJson,
  KeyringJson,
  LedgerKeyringJson,
  PublicKeyPath,
} from "@coral-xyz/common";

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
//k

export interface HdKeyringFactory {
  init(mnemonic: string, derivationPaths: Array<string>): HdKeyring;
  fromJson(obj: HdKeyringJson): HdKeyring;
}

export interface HdKeyring extends Keyring {
  readonly mnemonic: string;
  addDerivationPath(derivationPath: string): [string, string];
  deriveNextKey(): [string, string, string];
}

//
// Ledger keyring types
//

export interface LedgerKeyringFactory {
  init(publicKeyPaths: Array<PublicKeyPath>): LedgerKeyring;
  fromJson(obj: LedgerKeyringJson): LedgerKeyring;
}

export interface LedgerKeyring extends LedgerKeyringBase {
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  add(publicKeyPath: PublicKeyPath): Promise<void>;
}
