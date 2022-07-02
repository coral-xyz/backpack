import type {
  Commitment,
  TransactionSignature,
  SendOptions,
  Finality,
  ConfirmedSignaturesForAddress2Options,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
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
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  SOLANA_CONNECTION_RPC_UI,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
} from "@coral-xyz/common";
import type { Backend } from "../backend/solana-connection";
import type { Config, Handle } from "../types";

const logger = getLogger("solana-connection");

export function start(_cfg: Config, events: EventEmitter, b: Backend): Handle {
  const solanaConnection = ChannelAppUi.server(SOLANA_CONNECTION_RPC_UI);
  const solanaConnectionInjected = ChannelContentScript.server(
    CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST
  );

  solanaConnection.handler(withContextPort(b, events, handle));
  solanaConnectionInjected.handler(withContext(b, events, handleInjected));

  return {
    solanaConnection,
    solanaConnectionInjected,
  };
}

async function handleInjected<T = any>(
  ctx: Context<Backend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle solana connection injection ${msg.method}`, ctx, msg);
  return await handleImpl(ctx, msg);
}

async function handle<T = any>(
  ctx: Context<Backend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle solana connection extension ui ${msg.method}`, msg);
  return await handleImpl(ctx, msg);
}

async function handleImpl<T = any>(
  ctx: Context<Backend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  const { method, params } = msg;
  switch (method) {
    case SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO:
      return await handleGetAccountInfo(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH:
      return await handleGetLatestBlockhash(ctx, params[1]);
    case SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER:
      return await handleGetTokenAccountsByOwner(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION:
      return await handleSendRawTransaction(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION:
      return await handleConfirmTransaction(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO:
      return await handleGetMultipleAccountsInfo(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2:
      return await handleGetConfirmedSignaturesForAddress2(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION:
      return await handleGetParsedTransaction(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS:
      return await handleGetParsedTransactions(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS:
      return await handleCustomSplTokenAccounts(ctx, params[0]);
    default:
      throw new Error("invalid rpc method");
  }
}

async function handleGetAccountInfo(
  ctx: Context<Backend>,
  pubkey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getAccountInfo(
    new PublicKey(pubkey),
    commitment
  );
  return [resp];
}

async function handleGetLatestBlockhash(
  ctx: Context<Backend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getLatestBlockhash(commitment);
  return [resp];
}

async function handleGetTokenAccountsByOwner(
  ctx: Context<Backend>,
  ownerAddress: string,
  filter: { mint: string } | { programId: string },
  commitment?: Commitment
) {
  let _filter;
  // @ts-ignore
  if (filter.mint) {
    // @ts-ignore
    _filter = { mint: new PublicKey(filter.mint) };
  } else {
    // @ts-ignore
    _filter = { programId: new PublicKey(filter.programId) };
  }
  const resp = await ctx.backend.getTokenAccountsByOwner(
    new PublicKey(ownerAddress),
    _filter,
    commitment
  );
  return [resp];
}

async function handleSendRawTransaction(
  ctx: Context<Backend>,
  rawTransaction: Buffer | Uint8Array | Array<number>,
  options?: SendOptions
) {
  const resp = await ctx.backend.sendRawTransaction(rawTransaction, options);
  return [resp];
}

async function handleConfirmTransaction(
  ctx: Context<Backend>,
  signature: TransactionSignature,
  commitment?: Commitment
) {
  const { blockhash, lastValidBlockHeight } =
    await ctx.backend.getLatestBlockhash();

  const resp = await ctx.backend.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    commitment
  );
  return [resp];
}

async function handleGetMultipleAccountsInfo(
  ctx: Context<Backend>,
  pubkeys: string[],
  commitment?: Commitment
) {
  const resp = await ctx.backend.getMultipleAccountsInfo(
    pubkeys.map((p) => new PublicKey(p)),
    commitment
  );
  return [resp];
}

async function handleGetConfirmedSignaturesForAddress2(
  ctx: Context<Backend>,
  address: string,
  options?: ConfirmedSignaturesForAddress2Options,
  commitment?: Finality
) {
  const resp = await ctx.backend.getConfirmedSignaturesForAddress2(
    new PublicKey(address),
    options,
    commitment
  );
  return [resp];
}

async function handleGetParsedTransaction(
  ctx: Context<Backend>,
  signature: TransactionSignature,
  commitment?: Finality
) {
  const resp = await ctx.backend.getParsedTransaction(signature, commitment);
  return [resp];
}

async function handleGetParsedTransactions(
  ctx: Context<Backend>,
  signatures: TransactionSignature[],
  commitment?: Finality
) {
  const resp = await ctx.backend.getParsedTransactions(signatures, commitment);
  return [resp];
}

async function handleCustomSplTokenAccounts(
  ctx: Context<Backend>,
  pubkey: string
) {
  const resp = await ctx.backend.customSplTokenAccounts(new PublicKey(pubkey));
  return [resp];
}
