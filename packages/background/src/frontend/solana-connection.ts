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
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE,
  SOLANA_CONNECTION_RPC_GET_BALANCE,
  SOLANA_CONNECTION_RPC_GET_BLOCK_TIME,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_SLOT,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  withContext,
  withContextPort,
} from "@coral-xyz/common";
import type {
  SerializedTokenAccountsFilter,
  SolanaTokenAccountWithKeyAndProgramIdString,
  TokenMetadataString,
} from "@coral-xyz/secure-clients/legacyCommon";
import {
  addressLookupTableAccountParser,
  BackgroundSolanaConnection,
  deserializeTokenAccountsFilter,
  deserializeTransaction,
} from "@coral-xyz/secure-clients/legacyCommon";
import type {
  BlockheightBasedTransactionConfirmationStrategy,
  Commitment,
  ConfirmedSignaturesForAddress2Options,
  Finality,
  GetAccountInfoConfig,
  GetParsedProgramAccountsConfig,
  GetProgramAccountsConfig,
  GetVersionedTransactionConfig,
  SendOptions,
  TransactionSignature,
} from "@solana/web3.js";
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
    case SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO:
      return await handleGetAccountInfo(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT:
      return await handleGetAccountInfoAndContext(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH:
      return await handleGetLatestBlockhash(ctx, params[1]);
    case SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT:
      return await handleGetLatestBlockhashAndContext(ctx, params[1]);
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
    case SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI:
      return await handleCustomSplMetadataUri(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS:
      return await handleGetProgramAccounts(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE:
      return await handleGetFeeForMessage(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION:
      return await handleGetMinimumBalanceForRentExemption(
        ctx,
        params[0],
        params[1]
      );
    case SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE:
      return await handleGetTokenAccountBalance(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_BALANCE:
      return await handleGetBalance(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_SLOT:
      return await handleGetSlot(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_BLOCK_TIME:
      return await handleGetBlockTime(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER:
      return await handleGetParsedTokenAccountsByOwner(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS:
      return await handleGetTokenLargestAccounts(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO:
      return await handleGetParsedAccountInfo(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS:
      return await handleGetParsedProgramAccounts(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE:
      return await handleGetAddressLookupTable(ctx, params[0], params[1]);
    default:
      throw new Error("invalid rpc method");
  }
}

async function handleGetAccountInfo(
  ctx: Context<SolanaConnectionBackend>,
  pubkey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getAccountInfo(
    new PublicKey(pubkey),
    commitment
  );

  return [BackgroundSolanaConnection.accountInfoToJson(resp)];
}

async function handleGetAccountInfoAndContext(
  ctx: Context<SolanaConnectionBackend>,
  pubkey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getAccountInfoAndContext(
    new PublicKey(pubkey),
    commitment
  );
  return [resp];
}

async function handleGetLatestBlockhash(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getLatestBlockhash(commitment);
  return [resp];
}

async function handleGetLatestBlockhashAndContext(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getLatestBlockhashAndContext(commitment);
  return [resp];
}

async function handleGetTokenAccountsByOwner(
  ctx: Context<SolanaConnectionBackend>,
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
  ctx: Context<SolanaConnectionBackend>,
  rawTxStr: string,
  options?: SendOptions
) {
  const tx = deserializeTransaction(rawTxStr);
  const serializedTx = tx.serialize();
  const resp = await ctx.backend.sendRawTransaction(serializedTx, options);
  return [resp];
}

async function handleConfirmTransaction(
  ctx: Context<SolanaConnectionBackend>,
  signature:
    | BlockheightBasedTransactionConfirmationStrategy
    | TransactionSignature,
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
) {
  if (typeof signature === "string") {
    const { blockhash, lastValidBlockHeight } =
      await ctx.backend.getLatestBlockhash();
    signature = {
      signature,
      blockhash,
      lastValidBlockHeight,
    };
  }

  const resp = await ctx.backend.confirmTransaction(
    signature,
    commitmentOrConfig
  );
  return [resp];
}

async function handleGetMultipleAccountsInfo(
  ctx: Context<SolanaConnectionBackend>,
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
  ctx: Context<SolanaConnectionBackend>,
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
  ctx: Context<SolanaConnectionBackend>,
  signature: TransactionSignature,
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
) {
  const resp = await ctx.backend.getParsedTransaction(
    signature,
    commitmentOrConfig
  );
  return [resp];
}

async function handleGetParsedTransactions(
  ctx: Context<SolanaConnectionBackend>,
  signatures: TransactionSignature[],
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
) {
  const resp = await ctx.backend.getParsedTransactions(
    signatures,
    commitmentOrConfig
  );
  return [resp];
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

async function handleGetProgramAccounts(
  ctx: Context<SolanaConnectionBackend>,
  programId: string,
  configOrCommitment?: GetProgramAccountsConfig | Commitment
) {
  const resp = await ctx.backend.getProgramAccounts(
    new PublicKey(programId),
    configOrCommitment
  );
  return [resp];
}

async function handleGetFeeForMessage(
  ctx: Context<SolanaConnectionBackend>,
  messageStr: string,
  commitment?: Finality
) {
  const message = VersionedMessage.deserialize(decode(messageStr));
  const resp = await ctx.backend.getFeeForMessage(message, commitment);
  return [resp];
}

async function handleGetMinimumBalanceForRentExemption(
  ctx: Context<SolanaConnectionBackend>,
  dataLength: number,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getMinimumBalanceForRentExemption(
    dataLength,
    commitment
  );
  return [resp];
}

async function handleGetTokenAccountBalance(
  ctx: Context<SolanaConnectionBackend>,
  tokenAddress: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getTokenAccountBalance(
    new PublicKey(tokenAddress),
    commitment
  );
  return [resp];
}

async function handleGetBalance(
  ctx: Context<SolanaConnectionBackend>,
  publicKey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getBalance(
    new PublicKey(publicKey),
    commitment
  );
  return [resp];
}

async function handleGetSlot(
  ctx: Context<SolanaConnectionBackend>,
  c?: Commitment
) {
  const resp = await ctx.backend.getSlot(c);
  return [resp];
}

async function handleGetBlockTime(
  ctx: Context<SolanaConnectionBackend>,
  slot: number
) {
  const resp = await ctx.backend.getBlockTime(slot);
  return [resp];
}

async function handleGetParsedTokenAccountsByOwner(
  ctx: Context<SolanaConnectionBackend>,
  ownerAddress: string,
  filter: SerializedTokenAccountsFilter,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getParsedTokenAccountsByOwner(
    new PublicKey(ownerAddress),
    deserializeTokenAccountsFilter(filter),
    commitment
  );
  return [resp];
}

async function handleGetTokenLargestAccounts(
  ctx: Context<SolanaConnectionBackend>,
  mintAddress: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getTokenLargestAccounts(
    new PublicKey(mintAddress),
    commitment
  );
  return [resp];
}

async function handleGetParsedAccountInfo(
  ctx: Context<SolanaConnectionBackend>,
  publicKey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getParsedAccountInfo(
    new PublicKey(publicKey),
    commitment
  );
  return [resp];
}

async function handleGetParsedProgramAccounts(
  ctx: Context<SolanaConnectionBackend>,
  programId: string,
  configOrCommitment?: GetParsedProgramAccountsConfig | Commitment
) {
  const resp = await ctx.backend.getParsedProgramAccounts(
    new PublicKey(programId),
    configOrCommitment
  );
  return [resp];
}

async function handleGetAddressLookupTable(
  ctx: Context<SolanaConnectionBackend>,
  programId: string,
  config?: GetAccountInfoConfig
) {
  const resp = await ctx.backend.getAddressLookupTable(
    new PublicKey(programId),
    config
  );
  // @ts-ignore
  resp.value = addressLookupTableAccountParser.serialize(resp.value);
  return [resp];
}
