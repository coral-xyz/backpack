import { ethers, BigNumber } from "ethers";
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

export type TransferEthRequest = {
  to: string;
  amount: string;
};

export type TransferEthereumTokenRequest = {
  to: string;
  tokenAddress: string;
  amount: string;
};

export class Ethereum {
  public static async transferEth(
    ctx: EthereumContext,
    req: TransferEthRequest
  ): Promise<string> {
    const unsignedTx = {
      to: req.to,
      value: BigNumber.from(req.amount),
    };
    const receipt = await EthereumProvider.signAndSendTransaction(
      ctx,
      unsignedTx
    );
    return receipt.hash;
  }

  public static async transferToken(
    ctx: EthereumContext,
    req: TransferEthereumTokenRequest
  ): Promise<string> {
    const abi = ["function transfer(address to, uint amount) returns (bool)"];
    const erc20 = new ethers.Contract(req.tokenAddress, abi, ctx.provider);
    const unsignedTx = await erc20.populateTransaction.transfer(
      req.to,
      BigNumber.from(req.amount)
    );
    const receipt = await EthereumProvider.signAndSendTransaction(
      ctx,
      unsignedTx
    );
    return receipt.hash;
  }
}
