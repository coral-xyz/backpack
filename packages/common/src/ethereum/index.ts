import { ethers, BigNumber } from "ethers";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { BackgroundClient } from "../";
import { EthereumProvider } from "./provider";

export * from "./explorer";
export * from "./connection-url";
export * from "./token";

export type EthereumContext = {
  walletPublicKey: string;
  provider: ethers.providers.Provider;
  backgroundClient: BackgroundClient;
};

export type TransferEthRequest = UnsignedTransaction;

export type TransferEthereumTokenRequest = {
  to: string;
  tokenAddress: string;
  amount: string;
  // Overrides
  type?: number;
  gasLimit?: BigNumber;
  gasPrice?: BigNumber;
  nonce?: BigNumber;
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
};

export class Ethereum {
  public static async transferEth(
    ctx: EthereumContext,
    unsignedTx: TransferEthRequest
  ): Promise<string> {
    return await EthereumProvider.signAndSendTransaction(ctx, unsignedTx);
  }

  public static async transferToken(
    ctx: EthereumContext,
    req: TransferEthereumTokenRequest
  ): Promise<string> {
    const abi = ["function transfer(address to, uint amount) returns (bool)"];
    const erc20 = new ethers.Contract(req.tokenAddress, abi, ctx.provider);
    const unsignedTx = await erc20.populateTransaction.transfer(
      req.to,
      BigNumber.from(req.amount),
      {
        type: req.type ?? null,
        nonce: req.nonce ?? null,
        gasLimit: req.gasLimit ?? null,
        gasPrice: req.gasPrice ?? null,
        maxFeePerGas: req.maxFeePerGas ?? null,
        maxPriorityFeePerGas: req.maxPriorityFeePerGas ?? null,
      }
    );
    return await EthereumProvider.signAndSendTransaction(ctx, unsignedTx);
  }
}
