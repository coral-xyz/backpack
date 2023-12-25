import type { SecureEvent } from "@coral-xyz/secure-background/types";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { ethers as ethers5 } from "ethers5";
import { Transaction } from "ethers6";

import type { EthereumContext } from ".";

// Provider api used by the app UI. Spiritually the same as the injected
// provider with a slightly different API. Eventually it would be nice to
// combine the two.
export class EthereumProvider {
  /**
   * Serialize a transaction and send it to the background script for signing.
   */
  public static async signTransaction(
    ctx: EthereumContext,
    tx: any,
    uiOptions: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<any> {
    const { walletPublicKey, ethereumClient } = ctx;

    // transfrom transaction from ethers5 to ethers6
    const transaction = Transaction.from(
      ethers5.utils.serializeTransaction(tx as UnsignedTransaction)
    );

    const signer = ethereumClient?.getSigner(walletPublicKey);

    return signer?.signTransaction(transaction);
  }

  /**
   * Serialize a transaction and send it to the background script for signing
   * and sending.
   */
  public static async signAndSendTransaction(
    ctx: EthereumContext,
    tx: any,
    uiOptions: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<any> {
    const { walletPublicKey, ethereumClient } = ctx;

    const signer = ethereumClient?.getSigner(walletPublicKey);

    const response = await signer?.sendTransaction(tx, uiOptions);
    return response?.hash;
  }
}
