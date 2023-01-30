import type { PublicKeyPath } from "@coral-xyz/common";
import {
  generateUniqueId,
  LEDGER_INJECTED_CHANNEL_REQUEST,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
} from "@coral-xyz/common";

import type { LedgerKeyringJson } from "./types";

export class LedgerKeyringBase {
  protected publicKeyPaths: Array<PublicKeyPath>;

  constructor(publicKeyPaths: Array<PublicKeyPath>) {
    this.publicKeyPaths = publicKeyPaths;
  }

  public deletePublicKey(publicKey: string) {
    this.publicKeyPaths = this.publicKeyPaths.filter(
      (x) => x.publicKey !== publicKey
    );
  }

  public async add(publicKeyPath: PublicKeyPath) {
    const found = this.publicKeyPaths.find(
      (x) => x.publicKey === publicKeyPath.publicKey
    );
    if (found) {
      throw new Error("ledger account already exists");
    }
    this.publicKeyPaths.push(publicKeyPath);
  }

  public publicKeys(): Array<string> {
    return this.publicKeyPaths.map((x) => x.publicKey);
  }

  exportSecretKey(): string | null {
    throw new Error("ledger keyring cannot export secret keys");
  }

  importSecretKey(): string {
    throw new Error("ledger keyring cannot import secret keys");
  }

  public toString(): string {
    return JSON.stringify({
      publicKeyPaths: this.publicKeyPaths,
    });
  }

  public toJson(): LedgerKeyringJson {
    return {
      publicKeyPaths: this.publicKeyPaths,
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

/**
 * Send message from service worker to iframe
 * @param message object with message data
 */
export const postMessageToIframe = (
  message: Record<string, any> & { type: any }
) => {
  globalThis.clients
    .matchAll({
      frameType: "top-level",
      includeUncontrolled: true,
      type: "window",
      visibilityState: "visible",
    })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage(message);
      });
    });
};

// This code runs inside a ServiceWorker, so the message listener below must be
// created immediately. That's why `responseResolvers` is in the file's global scope.

const responseResolvers: {
  [reqId: string]: {
    resolve: (value: any) => void;
    reject: (reason?: string) => void;
  };
} = {};

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
