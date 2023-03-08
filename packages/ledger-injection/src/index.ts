import {
  getLogger,
  isValidEventOrigin,
  LEDGER_INJECTED_CHANNEL_REQUEST,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
  LEDGER_METHOD_ETHEREUM_SIGN_EIP712_MESSAGE,
  LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
  LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
  LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
  LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
} from "@coral-xyz/common";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { ethers } from "ethers";

const logger = getLogger("ledger-injection");
const { base58: bs58 } = ethers.utils;

// Script entry.
function main() {
  logger.debug("starting ledger injection");
  LEDGER.start();
  logger.debug("ledger injection ready");
}

class LedgerInjection {
  private transport?: Transport;
  private solana?: Solana;
  private ethereum?: Ethereum;

  constructor() {
    this.transport = undefined;
    this.solana = undefined;
    this.ethereum = undefined;
  }

  start() {
    window.addEventListener("message", async (event) => {
      if (!isValidEventOrigin(event)) {
        return;
      }
      if (event.data.type !== LEDGER_INJECTED_CHANNEL_REQUEST) {
        return;
      }

      logger.debug("ledger channel request", event);

      const { id, method, params } = event.data.detail;
      try {
        let result: any;
        switch (method) {
          case LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION:
            result = await this.handleEthereumSignTransaction(
              params[0],
              params[1]
            );
            break;
          case LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE:
            result = await this.handleEthereumSignMessage(params[0], params[1]);
            break;
          case LEDGER_METHOD_ETHEREUM_SIGN_EIP712_MESSAGE:
            result = await this.handleEthereumSignMessage(params[0], params[1]);
            break;
          case LEDGER_METHOD_SOLANA_SIGN_TRANSACTION:
            result = await this.handleSolanaSignTransaction(
              params[0],
              params[1]
            );
            break;
          case LEDGER_METHOD_SOLANA_SIGN_MESSAGE:
            // https://github.com/solana-labs/wallet-adapter/issues/171
            throw new Error("solana ledger does not support message signing");
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
      } catch (err) {
        const resp = {
          type: LEDGER_INJECTED_CHANNEL_RESPONSE,
          detail: {
            id,
            result: undefined,
            error: err.toString(),
          },
        };
        window.parent.postMessage(resp, "*");
      }
    });
  }

  async handleEthereumSignTransaction(
    transaction: UnsignedTransaction,
    derivationPath: string
  ) {
    await this.connectIfNeeded();
    const result = await this.ethereum!.signTransaction(
      derivationPath,
      ethers.utils.serializeTransaction(transaction).substring(2)
    );
    return ethers.utils.serializeTransaction(transaction, {
      r: "0x" + result.r,
      s: "0x" + result.s,
      v: parseInt(result.v),
    });
  }

  async handleEthereumSignMessage(message: string, derivationPath: string) {
    await this.connectIfNeeded();
    const result = await this.ethereum!.signPersonalMessage(
      derivationPath,
      message
    );
    return ethers.utils.joinSignature({
      r: "0x" + result.r,
      s: "0x" + result.s,
      v: result.v,
    });
  }

  async handleEthereumSignEIP712Message(message: any, derivationPath: string) {
    await this.connectIfNeeded();
    const result = await this.ethereum!.signEIP712Message(
      derivationPath,
      message
    );
    return result;
  }

  async handleSolanaSignTransaction(tx: string, derivationPath: string) {
    await this.connectIfNeeded();
    const result = await this.solana!.signTransaction(
      derivationPath,
      Buffer.from(bs58.decode(tx))
    );
    return bs58.encode(result.signature);
  }

  async connectIfNeeded() {
    if (!this.transport) {
      this.transport = await TransportWebHid.create();
      this.solana = new Solana(this.transport);
      this.ethereum = new Ethereum(this.transport);
    }
  }
}

const LEDGER = new LedgerInjection();

main();
