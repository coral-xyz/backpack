import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";

import type { LedgerKeyring, LedgerKeyringJson } from "./types";

export class LedgerKeyringBase
  implements
    Omit<LedgerKeyring, "prepareSignTransaction" | "prepareSignMessage">
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
      throw new Error("ledger account already exists");
    }
    this.walletDescriptors.push(walletDescriptor);
  }

  public publicKeys(): Array<string> {
    return this.walletDescriptors.map((x) => x.publicKey);
  }

  public exportSecretKey(_address: string): string | null {
    throw new Error("ledger keyring cannot export secret keys");
  }
  public importSecretKey(_secretKey: string): string {
    throw new Error("ledger keyring cannot import secret keys");
  }

  public seedToSecretKey(seed: Buffer, derivationPath: string): string {
    throw new Error("ledger keyring cannot derive secrets");
  }

  public secretKeyToPublicKeys(
    secretKey: string
  ): { type: string; publicKey: string }[] {
    throw new Error("ledger keyring has no secrets");
  }

  public toString(): string {
    return JSON.stringify({
      walletDescriptors: this.walletDescriptors,
    });
  }

  public toJson(): LedgerKeyringJson {
    return {
      walletDescriptors: this.walletDescriptors,
    };
  }
}
