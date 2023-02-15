import type { WalletDescriptor } from '@coral-xyz/common';

export class KeystoneKeyringBase {
  private keys: WalletDescriptor[] = []

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

  public addPublicKey(key: WalletDescriptor) {
    this.keys.push(key);
  }

  public setPublicKeys(keys: WalletDescriptor[]) {
    this.keys = [...keys]
  }

  public publicKeys() {
    return this.keys.map(e => e.publicKey);
  }

  public getAccounts() {
    return this.keys;
  }
}
