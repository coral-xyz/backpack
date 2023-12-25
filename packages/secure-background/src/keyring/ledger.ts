import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import {
  generateUniqueId,
  IS_MOBILE,
  isValidEventOrigin,
  LEDGER_INJECTED_CHANNEL_REQUEST,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
} from "@coral-xyz/common";

import { getAllBlockchainConfigs } from "../blockchain-configs/blockchains";

import { getIndexedPath, nextIndicesFromPaths } from "./derivationPaths";
import type { LedgerKeyring, LedgerKeyringJson } from "./types";

export class LedgerKeyringBase
  implements
    Omit<
      LedgerKeyring,
      | "signTransaction"
      | "signMessage"
      | "prepareSignTransaction"
      | "prepareSignMessage"
    >
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

  public mnemonicToSecretKey(mnemonic: string, derivationPath: string): string {
    throw new Error("ledger keyring cannot derive secrets");
  }

  public nextDerivationPath(offset = 0): {
    derivationPath: any;
    offset: number;
  } {
    const derivationPaths = this.walletDescriptors.map((w) => w.derivationPath);
    const { walletIndex } = nextIndicesFromPaths(
      derivationPaths.filter(Boolean) as string[]
    );
    const bip44CoinType =
      getAllBlockchainConfigs()[this.blockchain].bip44CoinType;
    const derivationPath = getIndexedPath(bip44CoinType, walletIndex! + offset);
    if (derivationPaths.includes(derivationPath)) {
      // This key is already included for some reason, try again with
      // incremented walletIndex
      return this.nextDerivationPath(offset + 1);
    }
    return { derivationPath, offset };
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
      postMessageToIframe(msg, true);
    });
  }
}

/**
 * Send message from service worker to iframe
 * @param message object with message data
 */
export const postMessageToIframe = (
  message: Record<string, any> & { type: any },
  requiresFocus = false
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
        if (!requiresFocus || client.focused) {
          client.postMessage(message);
        }
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

// TODO: removing-mobile-service-worker
if (!IS_MOBILE) {
  // Handle receiving postMessages
  self.addEventListener("message", (msg) => {
    try {
      if (!isValidEventOrigin(msg)) {
        return;
      }
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
}
