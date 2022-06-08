import * as bs58 from "bs58";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import * as core from "@200ms/ledger-core";
import {
  DerivationPath,
  LEDGER_INJECTED_CHANNEL_REQUEST,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
  LEDGER_METHOD_CONNECT,
  LEDGER_METHOD_SIGN_TRANSACTION,
  LEDGER_METHOD_SIGN_MESSAGE,
} from "@200ms/common";

// Script entry.
function main() {
  console.log("anchor: starting ledger injection");
  LEDGER.start();
  console.log("anchor: ledger injection ready");
}

class LedgerInjection {
  private transport?: Transport;

  constructor() {
    this.transport = undefined;
  }

  start() {
    window.addEventListener("message", async (event) => {
      if (event.data.type !== LEDGER_INJECTED_CHANNEL_REQUEST) {
        return;
      }
      const { id, method, params } = event.data.detail;

      let result: any;
      switch (method) {
        case LEDGER_METHOD_CONNECT:
          result = await this.handleConnect();
          break;
        case LEDGER_METHOD_SIGN_TRANSACTION:
          result = await this.handleSignTransaction(
            params[0],
            params[1],
            params[2]
          );
          break;
        case LEDGER_METHOD_SIGN_MESSAGE:
          result = await this.handleSignMessage(
            params[0],
            params[1],
            params[2]
          );
          break;
        default:
          throw new Error("unexpected event");
      }

      const resp = {
        type: LEDGER_INJECTED_CHANNEL_RESPONSE,
        detail: {
          id,
          result,
          error: undefined,
        },
      };
      window.parent.postMessage(resp, "*");
    });
  }

  async handleConnect() {
    if (this.transport) {
      throw new Error("already connected to ledger");
    }
    this.transport = await TransportWebHid.create();
    return "success";
  }

  async handleSignTransaction(tx: string, dPath: string, account: number) {
    await this.connectIfNeeded();

    const derivationPath = core.solanaDerivationPath(
      account,
      dPath as DerivationPath
    );
    const sig = await core.solanaLedgerSignBytes(
      this.transport!,
      derivationPath,
      Buffer.from(bs58.decode(tx))
    );
    return bs58.encode(sig);
  }

  async handleSignMessage(msg: string, dPath: string, account: number) {
    await this.connectIfNeeded();

    const derivationPath = core.solanaDerivationPath(
      account,
      dPath as DerivationPath
    );
    const sig = await core.solanaLedgerSignBytes(
      this.transport!,
      derivationPath,
      Buffer.from(bs58.decode(msg))
    );
    return bs58.encode(sig);
  }

  async connectIfNeeded() {
    if (!this.transport) {
      this.transport = await TransportWebHid.create();
    }
  }
}

let LEDGER = new LedgerInjection();

main();
