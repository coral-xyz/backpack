import { ethers } from "ethers";
import {
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
} from "../constants";
import type { EthereumContext } from ".";

// Provider API to be used by the app UI.
export class EthereumProvider {
  public static async signTransaction(
    ctx: EthereumContext,
    tx: any
  ): Promise<any> {
    const { walletPublicKey, backgroundClient } = ctx;
    const network = await ctx.provider.getNetwork();
    tx = {
      ...tx,
      chainId: network.chainId,
    };
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(tx)
    );
    const signedTx = await backgroundClient.request({
      method: UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
      params: [serializedTx, walletPublicKey],
    });
    return signedTx;
  }

  public static async signAndSendTransaction(
    ctx: EthereumContext,
    tx: any
  ): Promise<any> {
    const { walletPublicKey, backgroundClient } = ctx;
    const network = await ctx.provider.getNetwork();
    tx = {
      ...tx,
      chainId: network.chainId,
    };
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(tx)
    );
    const txHash = await backgroundClient.request({
      method: UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
      params: [serializedTx, walletPublicKey],
    });
    return txHash;
  }
}
