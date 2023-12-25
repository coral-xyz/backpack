import type { BackgroundClient } from "@coral-xyz/common";
import {
  ETHEREUM_PROVIDER_RPC_CALL,
  ETHEREUM_PROVIDER_RPC_ESTIMATE_GAS,
  ETHEREUM_PROVIDER_RPC_GET_AVATAR,
  ETHEREUM_PROVIDER_RPC_GET_BALANCE,
  ETHEREUM_PROVIDER_RPC_GET_BLOCK,
  ETHEREUM_PROVIDER_RPC_GET_BLOCK_NUMBER,
  ETHEREUM_PROVIDER_RPC_GET_BLOCK_WITH_TRANSACTIONS,
  ETHEREUM_PROVIDER_RPC_GET_CODE,
  ETHEREUM_PROVIDER_RPC_GET_FEE_DATA,
  ETHEREUM_PROVIDER_RPC_GET_GAS_PRICE,
  ETHEREUM_PROVIDER_RPC_GET_NETWORK,
  ETHEREUM_PROVIDER_RPC_GET_RESOLVER,
  ETHEREUM_PROVIDER_RPC_GET_STORAGE_AT,
  ETHEREUM_PROVIDER_RPC_GET_TRANSACTION,
  ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_COUNT,
  ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_RECEIPT,
  ETHEREUM_PROVIDER_RPC_LOOKUP_ADDRESS,
  ETHEREUM_PROVIDER_RPC_RESOLVE_NAME,
  ETHEREUM_PROVIDER_RPC_WAIT_FOR_TRANSACTION,
} from "@coral-xyz/common";
import type {
  Block,
  BlockWithTransactions,
  FeeData,
  Filter,
  Log,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { resolveProperties } from "@ethersproject/properties";
import type { Resolver } from "@ethersproject/providers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers5";

//
// Subclass ethers BaseProvider to route all requests through the background client.
//
// TODO: check ethers events setup and see if it works.
//

export class BackgroundEthereumProvider extends JsonRpcProvider {
  private _backgroundClient: BackgroundClient;

  constructor(
    backgroundClient: BackgroundClient,
    connectionUrl: string,
    chainId?: string
  ) {
    super(connectionUrl, chainId ? parseInt(chainId) : undefined);
    this._backgroundClient = backgroundClient;
  }

  async getBalance(
    address: string,
    blockTag?: string | number
  ): Promise<BigNumber> {
    const result = await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_BALANCE,
      params: [address, blockTag],
    });
    return result;
  }

  async getCode(
    address: string | Promise<string>,
    blockTag?: string | number
  ): Promise<string> {
    const params = await resolveProperties({ address, blockTag });
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_CODE,
      params: [params.address, params.blockTag],
    });
  }

  async getStorageAt(
    address: string | Promise<string>,
    position: BigNumber | Promise<BigNumber>,
    blockTag?: string | number
  ): Promise<string> {
    const params = await resolveProperties({ address, position, blockTag });
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_STORAGE_AT,
      params: [params.address, params.position, params.blockTag],
    });
  }

  async getTransactionCount(
    address: string | Promise<string>,
    blockTag?: string | number
  ): Promise<number> {
    const params = await resolveProperties({ address, blockTag });
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_COUNT,
      params: [params.address, params.blockTag],
    });
  }

  async getBlock(): Promise<Block> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_BLOCK,
      params: [],
    });
  }

  async getBlockWithTransactions(): Promise<BlockWithTransactions> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_BLOCK_WITH_TRANSACTIONS,
      params: [],
    });
  }

  async getAvatar(address: string): Promise<string> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_AVATAR,
      params: [address],
    });
  }

  async getResolver(address: string): Promise<Resolver | null> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_RESOLVER,
      params: [address],
    });
  }

  async lookupAddress(address: string): Promise<string> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_LOOKUP_ADDRESS,
      params: [address],
    });
  }

  async resolveName(name: string): Promise<string | null> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_RESOLVE_NAME,
      params: [name],
    });
  }

  async getNetwork() {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_NETWORK,
      params: [],
    });
  }

  async getBlockNumber(): Promise<number> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_BLOCK_NUMBER,
      params: [],
    });
  }

  async getGasPrice(): Promise<BigNumber> {
    const result = await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_GAS_PRICE,
      params: [],
    });
    return BigNumber.from(result);
  }

  async getFeeData(): Promise<FeeData> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_FEE_DATA,
      params: [],
    });
  }

  async call(transaction: TransactionRequest): Promise<string> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_CALL,
      params: [transaction],
    });
  }

  async estimateGas(transaction: TransactionRequest): Promise<BigNumber> {
    const result = await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_ESTIMATE_GAS,
      params: [transaction],
    });
    return BigNumber.from(result);
  }
  async getTransaction(hash: string): Promise<TransactionResponse> {
    const tx = await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_TRANSACTION,
      params: [hash],
    });
    // Wrap it with ethers _wrapTransaction to rehydrate the .wait function
    return this._wrapTransaction(tx);
  }

  async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_RECEIPT,
      params: [hash],
    });
  }

  async waitForTransaction(hash: string): Promise<TransactionReceipt> {
    return await this._backgroundClient.request({
      method: ETHEREUM_PROVIDER_RPC_WAIT_FOR_TRANSACTION,
      params: [hash],
    });
  }

  //
  // Not implemented
  //

  async getLogs(_filter: Filter): Promise<Log[]> {
    throw new Error("not implemented");
  }
}
