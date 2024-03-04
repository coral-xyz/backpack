import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";

import type { TrezorKeyring, TrezorKeyringJson } from "./types";

export class TrezorKeyringBase
  implements
    Omit<TrezorKeyring, "prepareSignTransaction" | "prepareSignMessage">
{
  protected walletDescriptors: Array<WalletDescriptor>;
  protected blockchain: Blockchain;

  constructor(
    walletDescriptors: Array<WalletDescriptor>,
    blockchain: Blockchain
  ) {
    this.walletDescriptors = walletDescriptors;
    this.blockchain = blockchain;
  }

  signTransaction(tx: Buffer, address: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  signMessage(tx: Buffer, address: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  public deletePublicKey(publicKey: string) {
    this.walletDescriptors = this.walletDescriptors.filter(
      (x) => x.publicKey !== publicKey
    );
  }

  public async add(walletDescriptor: WalletDescriptor) {
    const found = this.walletDescriptors.find(
      (x) => x.publicKey === walletDescriptor.publicKey
    );
    if (found) {
      throw new Error("trezor account already exists");
    }
    this.walletDescriptors.push(walletDescriptor);
  }

  public publicKeys(): Array<string> {
    return this.walletDescriptors.map((x) => x.publicKey);
  }

  public exportSecretKey(_address: string): string | null {
    throw new Error("trezor keyring cannot export secret keys");
  }
  public importSecretKey(_secretKey: string): string {
    throw new Error("trezor keyring cannot import secret keys");
  }

  public seedToSecretKey(seed: Buffer, derivationPath: string): string {
    throw new Error("trezor keyring cannot derive secrets");
  }

  public secretKeyToPublicKeys(
    secretKey: string
  ): { type: string; publicKey: string }[] {
    throw new Error("trezor keyring has no secrets");
  }

  public toString(): string {
    return JSON.stringify({
      walletDescriptors: this.walletDescriptors,
    });
  }

  public toJson(): TrezorKeyringJson {
    return {
      walletDescriptors: this.walletDescriptors,
    };
  }
}
