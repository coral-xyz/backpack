import {
  Keyring,
  KeyringFactory,
  KeyringJson,
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
} from "./types";
import { DerivationPath } from "@200ms/common";

export class EthereumKeyringFactory implements KeyringFactory {
  // @ts-ignore
  fromJson(payload: KeyringJson): Keyring {
    // todo
  }

  // @ts-ignore
  fromSecretKeys(secretKeys: Array<string>): Keyring {
    // todo
  }
}

export class EthereumKeyring implements Keyring {
  // @ts-ignore
  public publicKeys(): Array<string> {
    // todo
  }

  // @ts-ignore
  public async signTransaction(tx: Buffer, address: string): Promise<string> {
    // todo
  }

  // @ts-ignore
  public async signMessage(tx: Buffer, address: string): Promise<string> {
    // todo
  }

  // @ts-ignore
  public exportSecretKey(address: string): string | null {
    // todo
  }

  // @ts-ignore
  public importSecretKey(secretKey: string): string {
    // todo
  }

  public toJson(): any {
    // todo
  }
}
export class EthereumHdKeyringFactory implements HdKeyringFactory {
  public fromMnemonic(
    mnemonic: string,
    derivationPath?: DerivationPath
    // @ts-ignore
  ): HdKeyring {
    // todo
  }

  // @ts-ignore
  public generate(): HdKeyring {
    // todo
  }

  // @ts-ignore
  public fromJson(obj: HdKeyringJson): HdKeyring {
    // todo
  }
}

export class EthereumHdKeyring extends EthereumKeyring implements HdKeyring {
  readonly mnemonic: string;

  constructor() {
    super();
    this.mnemonic = ""; // todo
  }

  // @ts-ignore
  public deriveNext(): [string, number] {
    // todo
  }

  // @ts-ignore
  public getPublicKey(accountIndex: number): string {
    // todo
  }

  // @ts-ignore
  public toJson(): HdKeyringJson {
    // todo
  }
}
