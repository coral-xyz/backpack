import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import * as core from "./core";

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
      const { id, method, params } = event.data.detail;

      let result: any;
      switch (method) {
        case LEDGER_METHOD_CONNECT:
          result = await this.handleConnect();
          break;
        case LEDGER_METHOD_SIGN_TRANSACTION:
          result = this.handleSignTransaction(params[0]);
          break;
        case LEDGER_METHOD_SIGN_MESSAGE:
          result = this.handleSignMessage(params[0]);
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
        },
      };
      console.log("posting response", resp);
      window.parent.postMessage(resp, "*");
    });
  }

  async handleConnect() {
    console.log("connecting qwer here");
    if (TRANSPORT === null) {
      TRANSPORT = await TransportWebHid.create();
      console.log("transport", TRANSPORT);
    }
    // todo
    return "connect success";
  }

  handleSignTransaction(tx: string) {
    // todo
  }

  handleSignMessage(msg: string) {
    // todo
  }

  handleConfirmPubkey() {
    // todo
  }
}

let LEDGER = new LedgerInjection();

main();
