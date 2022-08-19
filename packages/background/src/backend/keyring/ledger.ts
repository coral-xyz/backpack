import {
  generateUniqueId,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
  LEDGER_INJECTED_CHANNEL_REQUEST,
} from "@coral-xyz/common";
import type { ImportedDerivationPath, LedgerKeyringJson } from "./types";
import { postMessageToIframe } from "../../shared";

// This code runs inside a ServiceWorker, so the message listener below must be
// created immediately. That's why `responseResolvers` is in the file's global scope.

const responseResolvers: {
  [reqId: string]: {
    resolve: (value: any) => void;
    reject: (reason?: string) => void;
  };
} = {};

export class LedgerKeyringBase {
  protected derivationPaths: Array<ImportedDerivationPath>;

  constructor(derivationPaths: Array<ImportedDerivationPath>) {
    this.derivationPaths = derivationPaths;
  }

  public keyCount(): number {
    return this.derivationPaths.length;
  }

  public deleteKeyIfNeeded(pubkey: string): number {
    const idx = this.derivationPaths.findIndex((dp) => dp.publicKey === pubkey);
    this.derivationPaths = this.derivationPaths.filter(
      (dp) => dp.publicKey !== pubkey
    );
    return idx;
  }

  public async ledgerImport(path: string, account: number, publicKey: string) {
    const found = this.derivationPaths.find(
      ({ path, account, publicKey: pk }) => publicKey === pk
    );
    if (found) {
      throw new Error("ledger account already exists");
    }
    this.derivationPaths.push({ path, account, publicKey });
  }

  public publicKeys(): Array<string> {
    return this.derivationPaths.map((dp) => dp.publicKey);
  }

  exportSecretKey(address: string): string | null {
    throw new Error("ledger keyring cannot export secret keys");
  }

  importSecretKey(secretKey: string): string {
    throw new Error("ledger keyring cannot import secret keys");
  }

  public toString(): string {
    return JSON.stringify({
      derivationPath: this.derivationPaths,
    });
  }

  public toJson(): LedgerKeyringJson {
    return {
      derivationPaths: this.derivationPaths,
    };
  }

  protected async request<T = any>(req: {
    method: string;
    params: Array<any>;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = generateUniqueId();
      responseResolvers[id] = { resolve, reject };
      const msg = {
        type: LEDGER_INJECTED_CHANNEL_REQUEST,
        detail: {
          id,
          ...req,
        },
      };
      postMessageToIframe(msg);
    });
  }
}

// Handle receiving postMessages
self.addEventListener("message", (msg) => {
  try {
    if (msg.data.type !== LEDGER_INJECTED_CHANNEL_RESPONSE) {
      return;
    }

    const {
      data: { detail },
    } = msg;
    const { id, result, error } = detail;

    const resolver = responseResolvers[id];
    if (!resolver) {
      // Why does this get thrown?
      throw new Error(`resolver not found for request id: ${id}`);
    }
    const { resolve, reject } = resolver;
    delete responseResolvers[id];

    if (error) {
      reject(error);
    }
    resolve(result);
  } catch (err) {
    console.error(err);
  }
});
