import type { ImportedDerivationPath } from './types';

export class KeystoneKeyringBase {
  private keys: ImportedDerivationPath[] = []

  exportSecretKey(): string | null {
    throw new Error("Keystone keyring cannot export secret keys");
  }

  importSecretKey(): string {
    throw new Error("Keystone keyring cannot import secret keys");
  }

  public deletePublicKey(publicKey: string) {
    this.keys = this.keys.filter(
      (dp) => dp.publicKey !== publicKey
    );
  }

  public addPublicKey(key: ImportedDerivationPath) {
    this.keys.push(key);
  }

  public setPublicKeys(keys: ImportedDerivationPath[]) {
    this.keys = [...keys]
  }

  public publicKeys() {
    return this.keys.map(e => e.publicKey);
  }

  public getAccounts() {
    return this.keys;
  }
}
