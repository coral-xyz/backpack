import type { BackgroundClient } from "@coral-xyz/common";
import type {
  SecureEvent,
  TypedObject,
} from "@coral-xyz/secure-background/types";
import type { FeeData } from "@ethersproject/abstract-provider";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { BigNumber } from "ethers5";
import { ethers } from "ethers5";

import { EthereumProvider } from "./provider";

export * from "./background-provider";
export * from "./token";
export * from "./tokens-uniswap";

export type EthereumContext = {
  walletPublicKey: string;
  provider: ethers.providers.Provider;
  chainId: string;
  ethereumClient: any | null;
  backgroundClient: BackgroundClient;
  feeData: FeeData;
};

export type EthereumTransactionOverrides = {
  // Overrides
  type?: number;
  gasLimit?: BigNumber;
  gasPrice?: BigNumber;
  nonce?: BigNumber;
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
};

export type TransferEthRequest = EthereumTransactionOverrides & {
  to: string;
  value: string;
};

export type TransferErc20Request = EthereumTransactionOverrides & {
  to: string;
  contractAddress: string;
  amount: string;
};

export type TransferErc721Request = EthereumTransactionOverrides & {
  from: string;
  to: string;
  contractAddress: string;
  tokenId: string;
};

export class Ethereum {
  public static async transferEth(
    ctx: EthereumContext,
    req: TransferEthRequest,
    uiOptions: TypedObject<
      SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"],
      "SEND_TOKEN"
    >
  ) {
    const unsignedTx = await Ethereum.transferEthTransaction(ctx, req);
    return await Ethereum.signAndSendTransaction(ctx, unsignedTx, uiOptions);
  }

  public static async transferEthTransaction(
    ctx: EthereumContext,
    req: TransferEthRequest
  ): Promise<UnsignedTransaction> {
    // Hack: no way to generate an UnsignedTransaction like there is for contracts?
    return Object.fromEntries(
      Object.entries({
        to: req.to,
        value: BigInt(req.value),
        type: req.type ?? null,
        nonce: req.nonce ?? undefined,
        gasLimit: req.gasLimit ?? null,
        gasPrice: req.gasPrice ?? null,
        maxFeePerGas: req.maxFeePerGas ?? null,
        maxPriorityFeePerGas: req.maxPriorityFeePerGas ?? null,
      }).filter(([_, v]) => v != null)
    ) as UnsignedTransaction;
  }

  public static async transferErc20(
    ctx: EthereumContext,
    req: TransferErc20Request,
    uiOptions: TypedObject<
      SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"],
      "SEND_TOKEN"
    >
  ): Promise<string> {
    const unsignedTx = await Ethereum.transferErc20Transaction(ctx, req);
    return await Ethereum.signAndSendTransaction(ctx, unsignedTx, uiOptions);
  }

  public static async transferErc20Transaction(
    ctx: EthereumContext,
    req: TransferErc20Request
  ): Promise<UnsignedTransaction> {
    const abi = ["function transfer(address to, uint amount) returns (bool)"];
    const erc20 = new ethers.Contract(req.contractAddress, abi, ctx.provider);
    return await erc20.populateTransaction.transfer(
      req.to,
      BigInt(req.amount),
      {
        type: req.type ?? null,
        nonce: req.nonce ?? null,
        gasLimit: req.gasLimit ?? null,
        gasPrice: req.gasPrice ?? null,
        maxFeePerGas: req.maxFeePerGas ?? null,
        maxPriorityFeePerGas: req.maxPriorityFeePerGas ?? null,
      }
    );
  }

  public static async transferErc721(
    ctx: EthereumContext,
    req: TransferErc721Request,
    uiOptions: TypedObject<
      SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"],
      "SEND_NFT"
    >
  ): Promise<string> {
    const unsignedTx = await Ethereum.transferErc721Transaction(ctx, req);
    return await Ethereum.signAndSendTransaction(ctx, unsignedTx, uiOptions);
  }

  public static async transferErc721Transaction(
    ctx: EthereumContext,
    req: TransferErc721Request
  ): Promise<UnsignedTransaction> {
    const abi = [
      "function safeTransferFrom(address from, address to, uint tokenId) returns (bool)",
    ];
    const erc721 = new ethers.Contract(req.contractAddress, abi, ctx.provider);
    return await erc721.populateTransaction.safeTransferFrom(
      req.from,
      req.to,
      req.tokenId,
      {
        type: req.type ?? null,
        nonce: req.nonce ?? null,
        gasLimit: req.gasLimit ?? null,
        gasPrice: req.gasPrice ?? null,
        maxFeePerGas: req.maxFeePerGas ?? null,
        maxPriorityFeePerGas: req.maxPriorityFeePerGas ?? null,
      }
    );
  }

  public static async signAndSendTransaction(
    ctx: EthereumContext,
    unsignedTx: UnsignedTransaction,
    uiOptions?: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<string> {
    return await EthereumProvider.signAndSendTransaction(
      ctx,
      unsignedTx,
      uiOptions ?? { type: "ANY" }
    );
  }
}
