import {
  Commitment,
  PublicKey,
  TransactionSignature,
  SendOptions,
  Finality,
  ConfirmedSignaturesForAddress2Options,
} from "@solana/web3.js";
import {
  getLogger,
  RpcRequest,
  RpcResponse,
  Context,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
} from "@200ms/common";
import { Io } from "../io";
import { BACKEND } from "../solana-connection/backend";

const logger = getLogger("solana-connection");

export function start() {
  Io.solanaConnection.handler(handle);
  Io.solanaConnectionInjected.handler(handleInjected);
}

async function handleInjected<T = any>(
  ctx: Context,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle solana connection injected ${msg.method}`);
  return await handle(msg);
}

async function handle<T = any>(msg: RpcRequest): Promise<RpcResponse<T>> {
  logger.debug(`handle solana connection ${msg.method}`, msg);
  return await handleImpl(msg);
}

async function handleImpl<T = any>(msg: RpcRequest): Promise<RpcResponse<T>> {
  const { method, params } = msg;
  switch (method) {
    case SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO:
      return await handleGetAccountInfo(params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH:
      return await handleGetLatestBlockhash(params[1]);
    case SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER:
      return await handleGetTokenAccountsByOwner(
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION:
      return await handleSendRawTransaction(params[0], params[1]);
    case SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION:
      return await handleConfirmTransaction(params[0], params[1]);
    case SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO:
      return await handleGetMultipleAccountsInfo(params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2:
      return await handleGetConfirmedSignaturesForAddress2(
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS:
      return await handleGetParsedTransactions(params[0], params[1]);
    case SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS:
      return await handleCustomSplTokenAccounts(params[0]);
    default:
      throw new Error("invalid rpc method");
  }
}

async function handleGetAccountInfo(pubkey: string, commitment?: Commitment) {
  const resp = await BACKEND!.getAccountInfo(new PublicKey(pubkey), commitment);
  return [resp];
}

async function handleGetLatestBlockhash(commitment?: Commitment) {
  const resp = await BACKEND!.getLatestBlockhash(commitment);
  return [resp];
}

async function handleGetTokenAccountsByOwner(
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
  const resp = await BACKEND!.getTokenAccountsByOwner(
    new PublicKey(ownerAddress),
    _filter,
    commitment
  );
  return [resp];
}

async function handleSendRawTransaction(
  rawTransaction: Buffer | Uint8Array | Array<number>,
  options?: SendOptions
) {
  const resp = await BACKEND!.sendRawTransaction(rawTransaction, options);
  return [resp];
}

async function handleConfirmTransaction(
  signature: TransactionSignature,
  commitment?: Commitment
) {
  const resp = await BACKEND!.confirmTransaction(signature, commitment);
  return [resp];
}

async function handleGetMultipleAccountsInfo(
  pubkeys: string[],
  commitment?: Commitment
) {
  const resp = await BACKEND!.getMultipleAccountsInfo(
    pubkeys.map((p) => new PublicKey(p)),
    commitment
  );
  return [resp];
}

async function handleGetConfirmedSignaturesForAddress2(
  address: string,
  options?: ConfirmedSignaturesForAddress2Options,
  commitment?: Finality
) {
  const resp = await BACKEND!.getConfirmedSignaturesForAddress2(
    new PublicKey(address),
    options,
    commitment
  );
  return [resp];
}

async function handleGetParsedTransactions(
  signatures: TransactionSignature[],
  commitment?: Finality
) {
  const resp = await BACKEND!.getParsedTransactions(signatures, commitment);
  return [resp];
}

async function handleCustomSplTokenAccounts(pubkey: string) {
  const resp = await BACKEND!.customSplTokenAccounts(new PublicKey(pubkey));
  return [resp];
}
