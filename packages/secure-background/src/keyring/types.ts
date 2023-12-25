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
  mnemonicToSecretKey(mnemonic: string, derivationPath: string): string;
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
  nextDerivationPath(): { derivationPath: any; offset: number };
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
  nextDerivationPath(): { derivationPath: any; offset: number };
  prepareSignTransaction(request: { publicKey: string; tx: string }): Promise<{
    signableTx: string;
    derivationPath: string;
  }>;
  prepareSignMessage(request: { publicKey: string; message: string }): Promise<{
    signableMessage: string;
    derivationPath: string;
  }>;
  signTransaction(tx: Buffer, address: string): Promise<string>;
  signMessage(tx: Buffer, address: string): Promise<string>;
  add(walletDescriptor: WalletDescriptor): Promise<void>;
  toJson(): LedgerKeyringJson;
}

export type AnyKeyring = Keyring | HdKeyring | LedgerKeyring;
