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
    default:
      throw new Error("invalid rpc method");
  }
}
