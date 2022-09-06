import type { BigNumber } from "ethers";
import type {
  RpcRequest,
  RpcResponse,
  Context,
  EventEmitter,
} from "@coral-xyz/common";
import {
  getLogger,
  withContext,
  withContextPort,
  ChannelAppUi,
  ChannelContentScript,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_RPC_UI,
  ETHEREUM_PROVIDER_RPC_GET_BALANCE,
  ETHEREUM_PROVIDER_RPC_GET_CODE,
  ETHEREUM_PROVIDER_RPC_GET_STORAGE_AT,
  ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_COUNT,
  ETHEREUM_PROVIDER_RPC_GET_BLOCK,
  ETHEREUM_PROVIDER_RPC_GET_BLOCK_WITH_TRANSACTIONS,
  ETHEREUM_PROVIDER_RPC_LOOKUP_ADDRESS,
  ETHEREUM_PROVIDER_RPC_RESOLVE_NAME,
  ETHEREUM_PROVIDER_RPC_GET_NETWORK,
  ETHEREUM_PROVIDER_RPC_GET_BLOCK_NUMBER,
  ETHEREUM_PROVIDER_RPC_GET_GAS_PRICE,
  ETHEREUM_PROVIDER_RPC_GET_FEE_DATA,
  ETHEREUM_PROVIDER_RPC_CALL,
  ETHEREUM_PROVIDER_RPC_ESTIMATE_GAS,
  ETHEREUM_PROVIDER_RPC_GET_TRANSACTION,
  ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_RECEIPT,
  ETHEREUM_PROVIDER_RPC_WAIT_FOR_TRANSACTION,
} from "@coral-xyz/common";
import type { EthereumConnectionBackend } from "../backend/ethereum-connection";
import type { Config, Handle } from "../types";

const logger = getLogger("ethereum-connection");

export function start(
  cfg: Config,
  events: EventEmitter,
  b: EthereumConnectionBackend
): Handle {
  const ethereumConnection = ChannelAppUi.server(
    CHANNEL_ETHEREUM_CONNECTION_RPC_UI
  );
  ethereumConnection.handler(withContextPort(b, events, handle));

  const ethereumConnectionInjected = (() => {
    if (cfg.isMobile) return;

    const s = ChannelContentScript.server(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST
    );
    s.handler(withContext(b, events, handleInjected));
    return s;
  })();

  return {
    ethereumConnection,
    ethereumConnectionInjected,
  };
}

async function handleInjected<T = any>(
  ctx: Context<EthereumConnectionBackend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle ethereum connection injection ${msg.method}`, ctx, msg);
  return await handleImpl(ctx, msg);
}

async function handle<T = any>(
  ctx: Context<EthereumConnectionBackend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle ethereum connection extension ui ${msg.method}`, msg);
  return await handleImpl(ctx, msg);
}

async function handleImpl<T = any>(
  ctx: Context<EthereumConnectionBackend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  const { method, params } = msg;
  switch (method) {
    case ETHEREUM_PROVIDER_RPC_GET_BALANCE:
      return await handleGetBalance(ctx, params[0], params[1]);
    case ETHEREUM_PROVIDER_RPC_GET_CODE:
      return await handleGetCode(ctx, params[0], params[1]);
    case ETHEREUM_PROVIDER_RPC_GET_STORAGE_AT:
      return await handleGetStorageAt(ctx, params[0], params[1], params[2]);
    case ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_COUNT:
      return await handleGetTransactionCount(ctx, params[0], params[1]);
    case ETHEREUM_PROVIDER_RPC_GET_BLOCK:
      return await handleGetBlock(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_GET_BLOCK_WITH_TRANSACTIONS:
      return await handleGetBlockWithTransactions(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_LOOKUP_ADDRESS:
      return await handleLookupAddress(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_RESOLVE_NAME:
      return await handleResolveName(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_GET_NETWORK:
      return await handleGetNetwork(ctx);
    case ETHEREUM_PROVIDER_RPC_GET_BLOCK_NUMBER:
      return await handleGetBlockNumber(ctx);
    case ETHEREUM_PROVIDER_RPC_GET_GAS_PRICE:
      return await handleGetGasPrice(ctx);
    case ETHEREUM_PROVIDER_RPC_GET_FEE_DATA:
      return await handleGetFeeData(ctx);
    case ETHEREUM_PROVIDER_RPC_CALL:
      return await handleCall(ctx, params[0], params[1]);
    case ETHEREUM_PROVIDER_RPC_ESTIMATE_GAS:
      return await handleEstimateGas(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_GET_TRANSACTION:
      return await handleGetTransaction(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_RECEIPT:
      return await handleGetTransactionReceipt(ctx, params[0]);
    case ETHEREUM_PROVIDER_RPC_WAIT_FOR_TRANSACTION:
      return await handleWaitForTransaction(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    default:
      throw new Error("invalid rpc method");
  }
}

async function handleGetBalance(
  ctx: Context<EthereumConnectionBackend>,
  publicKey: string,
  blockTag?: string
) {
  return await ctx.backend.getBalance(publicKey, blockTag);
}

async function handleGetCode(
  ctx: Context<EthereumConnectionBackend>,
  address: string,
  blockTag?: string
) {
  return await ctx.backend.getCode(address, blockTag);
}

async function handleGetStorageAt(
  ctx: Context<EthereumConnectionBackend>,
  address: string,
  position: BigNumber,
  blockTag?: string
) {
  return await ctx.backend.getStorageAt(address, position, blockTag);
}

async function handleGetTransactionCount(
  ctx: Context<EthereumConnectionBackend>,
  address: string,
  blockTag?: string
) {
  return await ctx.backend.getTransactionCount(address, blockTag);
}

async function handleGetBlock(
  ctx: Context<EthereumConnectionBackend>,
  block: number
) {
  return await ctx.backend.getBlock(block);
}

async function handleGetBlockWithTransactions(
  ctx: Context<EthereumConnectionBackend>,
  block: number
) {
  return await ctx.backend.getBlockWithTransactions(block);
}

async function handleLookupAddress(
  ctx: Context<EthereumConnectionBackend>,
  address: string
) {
  return await ctx.backend.lookupAddress(address);
}

async function handleResolveName(
  ctx: Context<EthereumConnectionBackend>,
  name: string
) {
  return await ctx.backend.resolveName(name);
}
async function handleGetNetwork(ctx: Context<EthereumConnectionBackend>) {
  return await ctx.backend.getNetwork();
}

async function handleGetBlockNumber(ctx: Context<EthereumConnectionBackend>) {
  return await ctx.backend.getBlockNumber();
}

async function handleGetGasPrice(ctx: Context<EthereumConnectionBackend>) {
  return await ctx.backend.getGasPrice();
}

async function handleGetFeeData(ctx: Context<EthereumConnectionBackend>) {
  return await ctx.backend.getFeeData();
}

async function handleCall(
  ctx: Context<EthereumConnectionBackend>,
  transaction: string,
  blockTag?: string
) {
  return await ctx.backend.call(transaction, blockTag);
}

async function handleEstimateGas(
  ctx: Context<EthereumConnectionBackend>,
  transaction: string
) {
  return await ctx.backend.estimateGas(transaction);
}

async function handleGetTransaction(
  ctx: Context<EthereumConnectionBackend>,
  hash: string
) {
  return await ctx.backend.getTransaction(hash);
}

async function handleGetTransactionReceipt(
  ctx: Context<EthereumConnectionBackend>,
  hash: string
) {
  return await ctx.backend.getTransactionReceipt(hash);
}

async function handleWaitForTransaction(
  ctx: Context<EthereumConnectionBackend>,
  hash: string,
  confirms?: number,
  timeout?: number
) {
  return await ctx.backend.waitForTransaction(hash, confirms, timeout);
}
