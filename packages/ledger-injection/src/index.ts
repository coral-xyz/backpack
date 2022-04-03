import * as bs58 from "bs58";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import * as core from "./core";
import { Buffer } from "buffer";

// TODO: share all these with a common package.
const LEDGER_INJECTED_CHANNEL_REQUEST = "ledger-injected-request";
const LEDGER_INJECTED_CHANNEL_RESPONSE = "ledger-injected-response";
const LEDGER_METHOD_CONNECT = "ledger-method-connect";
const LEDGER_METHOD_UNLOCK = "ledger-method-unlock";
const LEDGER_METHOD_SIGN_TRANSACTION = "ledger-method-sign-transaction";
const LEDGER_METHOD_SIGN_MESSAGE = "ledger-method-sign-message";
const LEDGER_METHOD_CONFIRM_PUBKEY = "ledger-confirm-pubkey";

// Script entry.
function main() {
  console.log("anchor: starting ledger injection");
  LEDGER.start();
  console.log("anchor: ledger injection ready");
}

let TRANSPORT: Transport | null = null;

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
      console.log("ledger event", event);
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
        case LEDGER_METHOD_CONFIRM_PUBKEY:
          result = this.handleConfirmPubkey();
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
      dPath as core.DerivationPath
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
      dPath as core.DerivationPath
    );
    const sig = await core.solanaLedgerSignBytes(
      this.transport!,
      derivationPath,
      Buffer.from(bs58.decode(msg))
    );
    return bs58.encode(sig);
  }

  handleConfirmPubkey() {
    // todo
  }

  async connectIfNeeded() {
    if (!this.transport) {
      this.transport = await TransportWebHid.create();
    }
  }
}

let LEDGER = new LedgerInjection();

main();
