import type {
  Context,
  EventEmitter,
  RpcRequest,
  RpcResponse,
} from "@coral-xyz/common";
import {
  ChannelAppUi,
  ChannelContentScript,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  getLogger,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  SOLANA_CONNECTION_RPC_UI,
  withContext,
  withContextPort,
} from "@coral-xyz/common";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Backend } from "../backend/solana-connection";
import type { Config, Handle } from "../types";

// prepends ctx:Context<Backend> to params and wraps return value inside an array
type WithContext<T extends keyof InstanceType<typeof Connection>> =
  InstanceType<typeof Connection>[T] extends (...a: infer U) => infer R
    ? (b: Context<Backend>, ...a: U) => Promise<[Awaited<R>]>
    : never;

const logger = getLogger("solana-connection");

export function start(cfg: Config, events: EventEmitter, b: Backend): Handle {
  const solanaConnection = ChannelAppUi.server(SOLANA_CONNECTION_RPC_UI);
  solanaConnection.handler(withContextPort(b, events, handle));

  const solanaConnectionInjected = (() => {
    if (cfg.isMobile) return;

    const s = ChannelContentScript.server(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST
    );
    s.handler(withContext(b, events, handleInjected));
    return s;
  })();

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
    case SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS:
      return await handleGetProgramAccounts(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE:
      return await handleGetFeeForMessage(ctx, params[0], params[1]);
    default:
      throw new Error("invalid rpc method");
  }
}

const handleGetAccountInfo: WithContext<"getAccountInfo"> = async function (
  ctx,
  pubkey,
  commitment
) {
  const resp = await ctx.backend.getAccountInfo(pubkey, commitment);
  return [resp];
};

const handleGetLatestBlockhash: WithContext<"getLatestBlockhash"> =
  async function (ctx, commitment) {
    const resp = await ctx.backend.getLatestBlockhash(commitment);
    return [resp];
  };

const handleGetTokenAccountsByOwner: WithContext<"getTokenAccountsByOwner"> =
  async function (ctx, ownerAddress, filter, commitment) {
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
  };

const handleSendRawTransaction: WithContext<"sendRawTransaction"> =
  async function (ctx, rawTransaction, options) {
    const resp = await ctx.backend.sendRawTransaction(rawTransaction, options);
    return [resp];
  };

const handleConfirmTransaction: WithContext<"confirmTransaction"> =
  async function (ctx, signature, commitment) {
    let _signature: any = signature;

    if (typeof signature === "string") {
      const { blockhash, lastValidBlockHeight } =
        await ctx.backend.getLatestBlockhash();
      _signature = {
        signature,
        blockhash,
        lastValidBlockHeight,
      };
    }

    const resp = await ctx.backend.confirmTransaction(_signature, commitment);
    return [resp];
  };

const handleGetMultipleAccountsInfo: WithContext<"getMultipleAccountsInfo"> =
  async function (ctx, pubkeys, commitment) {
    const resp = await ctx.backend.getMultipleAccountsInfo(
      pubkeys.map((p) => new PublicKey(p)),
      commitment
    );
    return [resp];
  };

const handleGetConfirmedSignaturesForAddress2: WithContext<"getConfirmedSignaturesForAddress2"> =
  async function (ctx, address, options, commitment) {
    const resp = await ctx.backend.getConfirmedSignaturesForAddress2(
      new PublicKey(address),
      options,
      commitment
    );
    return [resp];
  };

const handleGetParsedTransaction: WithContext<"getParsedTransaction"> =
  async function (ctx, signature, commitment) {
    const resp = await ctx.backend.getParsedTransaction(signature, commitment);
    return [resp];
  };

const handleGetParsedTransactions: WithContext<"getParsedTransactions"> =
  async function (ctx, signatures, commitment) {
    const resp = await ctx.backend.getParsedTransactions(
      signatures,
      commitment
    );
    return [resp];
  };

async function handleCustomSplTokenAccounts(
  ctx: Context<Backend>,
  pubkey: string
) {
  const resp = await ctx.backend.customSplTokenAccounts(new PublicKey(pubkey));
  return [resp];
}

const handleGetProgramAccounts: WithContext<"getProgramAccounts"> =
  async function (ctx, programId, configOrCommitment) {
    const resp = await ctx.backend.getProgramAccounts(
      new PublicKey(programId),
      configOrCommitment
    );
    return [resp];
  };

const handleGetFeeForMessage: WithContext<"getFeeForMessage"> = async function (
  ctx,
  message,
  commitment
) {
  const resp = await ctx.backend.getFeeForMessage(message, commitment);
  return [resp];
};
