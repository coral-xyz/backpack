import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import Solana from "@ledgerhq/hw-app-solana";
import Ethereum, { ledgerService } from "@ledgerhq/hw-app-eth";
import { ethers } from "ethers";
import { SignatureLike } from "@ethersproject/bytes";
import {
  accountDerivationPath,
  getLogger,
  Blockchain,
  DerivationPath,
  LEDGER_INJECTED_CHANNEL_REQUEST,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
  LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
  LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
  LEDGER_METHOD_ETHEREUM_SIGN_EIP712_MESSAGE,
  LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
  LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
} from "@coral-xyz/common";

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
      if (event.data.type !== LEDGER_INJECTED_CHANNEL_REQUEST) {
        return;
      }

      logger.debug("ledger debug channel request", event);

      const { id, method, params } = event.data.detail;
      try {
        let result: any;
        switch (method) {
          case LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION:
            result = await this.handleEthereumSignTransaction(
              params[0],
              params[1],
              params[2]
            );
            break;
          case LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE:
            result = await this.handleEthereumSignMessage(
              params[0],
              params[1],
              params[2]
            );
            break;
          case LEDGER_METHOD_ETHEREUM_SIGN_EIP712_MESSAGE:
            result = await this.handleEthereumSignMessage(
              params[0],
              params[1],
              params[2]
            );
            break;
          case LEDGER_METHOD_SOLANA_SIGN_TRANSACTION:
            result = await this.handleSolanaSignTransaction(
              params[0],
              params[1],
              params[2]
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
        logger.error("error here", err);
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
    transaction: string,
    derivationPath: DerivationPath,
    account: number
  ) {
    await this.connectIfNeeded();
    const result = await this.ethereum!.signTransaction(
      accountDerivationPath(Blockchain.ETHEREUM, derivationPath, account),
      transaction
    );
    console.log(result);
    // Might be a better way to do this?
    const parsedTransaction = ethers.utils.parseTransaction(transaction);
    return ethers.utils.serializeTransaction(parsedTransaction, {
      r: "0x" + result.r,
      s: "0x" + result.s,
      v: parseInt(result.v),
    });
  }

  async handleEthereumSignMessage(
    message: string,
    derivationPath: DerivationPath,
    account: number
  ) {
    await this.connectIfNeeded();
    const result = await this.ethereum!.signPersonalMessage(
      accountDerivationPath(Blockchain.ETHEREUM, derivationPath, account),
      message
    );
    return result;
  }

  async handleEthereumSignEIP712Message(
    message: any,
    derivationPath: DerivationPath,
    account: number
  ) {
    await this.connectIfNeeded();
    const result = await this.ethereum!.signEIP712Message(
      accountDerivationPath(Blockchain.ETHEREUM, derivationPath, account),
      message
    );
    return result;
  }

  async handleSolanaSignTransaction(
    tx: string,
    derivationPath: DerivationPath,
    account: number
  ) {
    await this.connectIfNeeded();
    const result = await this.solana!.signTransaction(
      accountDerivationPath(Blockchain.SOLANA, derivationPath, account),
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
