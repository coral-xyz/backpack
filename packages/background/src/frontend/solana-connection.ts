import type {
  Context,
  EventEmitter,
  RpcRequest,
  RpcResponse,
} from "@coral-xyz/common";
import {
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_RPC_UI,
  ChannelAppUi,
  ChannelContentScript,
  getLogger,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  withContext,
  withContextPort,
} from "@coral-xyz/common";
import type {
  SolanaTokenAccountWithKeyAndProgramIdString,
  TokenMetadataString,
} from "@coral-xyz/secure-clients/legacyCommon";
import { BackgroundSolanaConnection } from "@coral-xyz/secure-clients/legacyCommon";
import { PublicKey, VersionedMessage } from "@solana/web3.js";
import { decode } from "bs58";

import type { SolanaConnectionBackend } from "../backend/solana-connection";
import type { Config, Handle } from "../types";

const logger = getLogger("solana-connection");

export function start(
  cfg: Config,
  events: EventEmitter,
  b: SolanaConnectionBackend
): Handle {
  const solanaConnection = ChannelAppUi.server(
    CHANNEL_SOLANA_CONNECTION_RPC_UI
  );
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
  ctx: Context<SolanaConnectionBackend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle solana connection injection ${msg.method}`, ctx, msg);
  return await handleImpl(ctx, msg);
}

async function handle<T = any>(
  ctx: Context<SolanaConnectionBackend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle solana connection extension ui ${msg.method}`, msg);
  return await handleImpl(ctx, msg);
}

async function handleImpl<T = any>(
  ctx: Context<SolanaConnectionBackend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  const { method, params } = msg;
  switch (method) {
    case SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS:
      return await handleCustomSplTokenAccounts(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI:
      return await handleCustomSplMetadataUri(ctx, params[0], params[1]);
    default:
      throw new Error("invalid rpc method");
  }
}

async function handleCustomSplTokenAccounts(
  ctx: Context<SolanaConnectionBackend>,
  pubkey: string
) {
  const resp = await ctx.backend.customSplTokenAccounts(new PublicKey(pubkey));
  return [BackgroundSolanaConnection.customSplTokenAccountsToJson(resp)];
}

async function handleCustomSplMetadataUri(
  ctx: Context<SolanaConnectionBackend>,
  nftTokens: Array<SolanaTokenAccountWithKeyAndProgramIdString>,
  nftTokenMetadata: Array<TokenMetadataString | null>
) {
  const resp = await ctx.backend.customSplMetadataUri(
    nftTokens,
    nftTokenMetadata
  );
  return [resp];
}
