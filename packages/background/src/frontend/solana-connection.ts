import type {
  Context,
  EventEmitter,
  RpcRequest,
  RpcResponse,
  SerializedTokenAccountsFilter,
} from "@coral-xyz/common";
import {
  addressLookupTableAccountParser,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_RPC_UI,
  ChannelAppUi,
  ChannelContentScript,
  deserializeTokenAccountsFilter,
  deserializeTransaction,
  getLogger,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE,
  SOLANA_CONNECTION_RPC_GET_BALANCE,
  SOLANA_CONNECTION_RPC_GET_BALANCE_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_BLOCK,
  SOLANA_CONNECTION_RPC_GET_BLOCK_HEIGHT,
  SOLANA_CONNECTION_RPC_GET_BLOCK_PRODUCTION,
  SOLANA_CONNECTION_RPC_GET_BLOCK_SIGNATURES,
  SOLANA_CONNECTION_RPC_GET_BLOCK_TIME,
  SOLANA_CONNECTION_RPC_GET_BLOCKS,
  SOLANA_CONNECTION_RPC_GET_CLUSTER_NODES,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK_SIGNATURES,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_EPOCH_INFO,
  SOLANA_CONNECTION_RPC_GET_EPOCH_SCHEDULE,
  SOLANA_CONNECTION_RPC_GET_FEE_CALCULATOR_FOR_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
  SOLANA_CONNECTION_RPC_GET_FIRST_AVAILABLE_BLOCK,
  SOLANA_CONNECTION_RPC_GET_GENESIS_HASH,
  SOLANA_CONNECTION_RPC_GET_INFLATION_GOVERNOR,
  SOLANA_CONNECTION_RPC_GET_INFLATION_REWARD,
  SOLANA_CONNECTION_RPC_GET_LARGEST_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_LEADER_SCHEDULE,
  SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
  SOLANA_CONNECTION_RPC_GET_MINIMUM_LEDGER_SLOT,
  SOLANA_CONNECTION_RPC_GET_MULTIPLE_ACCOUNTS_INFO_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_NONCE,
  SOLANA_CONNECTION_RPC_GET_NONCE_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_RECENT_PERFORMANCE_SAMPLES,
  SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUS,
  SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUSES,
  SOLANA_CONNECTION_RPC_GET_SIGNATURES_FOR_ADDRESS,
  SOLANA_CONNECTION_RPC_GET_SLOT,
  SOLANA_CONNECTION_RPC_GET_SLOT_LEADER,
  SOLANA_CONNECTION_RPC_GET_SLOT_LEADERS,
  SOLANA_CONNECTION_RPC_GET_STAKE_ACTIVATION,
  SOLANA_CONNECTION_RPC_GET_SUPPLY,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_TOKEN_SUPPLY,
  SOLANA_CONNECTION_RPC_GET_TOTAL_SUPPLY,
  SOLANA_CONNECTION_RPC_GET_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_TRANSACTION_COUNT,
  SOLANA_CONNECTION_RPC_GET_VERSION,
  SOLANA_CONNECTION_RPC_GET_VOTE_ACCOUNTS,
  SOLANA_CONNECTION_RPC_REQUEST_AIRDROP,
  SOLANA_CONNECTION_RPC_SEND_ENCODED_TRANSACTION,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  withContext,
  withContextPort,
} from "@coral-xyz/common";
import type {
  Blockhash,
  BlockheightBasedTransactionConfirmationStrategy,
  Commitment,
  ConfirmedSignaturesForAddress2Options,
  Finality,
  GetAccountInfoConfig,
  GetBlockProductionConfig,
  GetLargestAccountsConfig,
  GetParsedProgramAccountsConfig,
  GetProgramAccountsConfig,
  GetSupplyConfig,
  MessageArgs,
  SendOptions,
  SignaturesForAddressOptions,
  SignatureStatusConfig,
  TokenAccountsFilter,
  TransactionSignature,
} from "@solana/web3.js";
import { Message, PublicKey, VersionedMessage } from "@solana/web3.js";
import * as bs58 from "bs58";
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
    case SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO:
      return await handleGetMultipleAccountsInfo(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO:
      return await handleGetAccountInfo(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT:
      return await handleGetAccountInfoAndContext(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH:
      return await handleGetLatestBlockhash(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT:
      return await handleGetLatestBlockhashAndContext(ctx, params[0]);
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
    case SOLANA_CONNECTION_RPC_GET_BALANCE_AND_CONTEXT:
      return await handleGetBalanceAndContext(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_MINIMUM_LEDGER_SLOT:
      return await handleGetMinimumLedgerSlot(ctx);
    case SOLANA_CONNECTION_RPC_GET_FIRST_AVAILABLE_BLOCK:
      return await handleGetFirstAvailableBlock(ctx);
    case SOLANA_CONNECTION_RPC_GET_SUPPLY:
      return await handleGetSupply(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_TOKEN_SUPPLY:
      return await handleGetTokenSupply(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_LARGEST_ACCOUNTS:
      return await handleGetLargestAccounts(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_MULTIPLE_ACCOUNTS_INFO_AND_CONTEXT:
      return await handleGetMultipleAccountsInfoAndContext(
        ctx,
        params[0],
        params[1]
      );
    case SOLANA_CONNECTION_RPC_GET_STAKE_ACTIVATION:
      return await handleGetStakeActivation(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_GET_CLUSTER_NODES:
      return await handleGetClusterNodes(ctx);
    case SOLANA_CONNECTION_RPC_GET_VOTE_ACCOUNTS:
      return await handleGetVoteAccounts(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_SLOT_LEADER:
      return await handleGetSlotLeader(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_SLOT_LEADERS:
      return await handleGetSlotLeaders(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUS:
      return await handleGetSignatureStatus(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUSES:
      return await handleGetSignatureStatuses(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_TRANSACTION_COUNT:
      return await handleGetTransactionCount(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_TOTAL_SUPPLY:
      return await handleGetTotalSupply(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_INFLATION_GOVERNOR:
      return await handleGetInflationGovernor(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_INFLATION_REWARD:
      return await handleGetInflationReward(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_EPOCH_INFO:
      return await handleGetEpochInfo(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_EPOCH_SCHEDULE:
      return await handleGetEpochSchedule(ctx);
    case SOLANA_CONNECTION_RPC_GET_LEADER_SCHEDULE:
      return await handleGetLeaderSchedule(ctx);
    case SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH_AND_CONTEXT:
      return await handleGetRecentBlockhashAndContext(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_RECENT_PERFORMANCE_SAMPLES:
      return await handleGetRecentPerformanceSamples(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_FEE_CALCULATOR_FOR_BLOCKHASH:
      return await handleGetFeeCalculatorForBlockhash(
        ctx,
        params[0],
        params[1]
      );
    case SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH:
      return await handleGetRecentBlockhash(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_VERSION:
      return await handleGetVersion(ctx);
    case SOLANA_CONNECTION_RPC_GET_GENESIS_HASH:
      return await handleGetGenesisHash(ctx);
    case SOLANA_CONNECTION_RPC_GET_BLOCK:
      return await handleGetBlock(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_BLOCK_HEIGHT:
      return await handleGetBlockHeight(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_BLOCK_PRODUCTION:
      return await handleGetBlockProduction(ctx, params[0]);
    case SOLANA_CONNECTION_RPC_GET_TRANSACTION:
      return await handleGetTransaction(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK:
      return await handleGetConfirmedBlock(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_BLOCKS:
      return await handleGetBlocks(ctx, params[0], params[1], params[2]);
    case SOLANA_CONNECTION_RPC_GET_BLOCK_SIGNATURES:
      return await handleGetBlockSignatures(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK_SIGNATURES:
      return await handleGetConfirmedBlockSignatures(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_CONFIRMED_TRANSACTION:
      return await handleGetConfirmedTransaction(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTION:
      return await handleGetParsedConfirmedTransaction(
        ctx,
        params[0],
        params[1]
      );
    case SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTIONS:
      return await handleGetParsedConfirmedTransactions(
        ctx,
        params[0],
        params[1]
      );
    case SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS:
      return await handleGetConfirmedSignaturesForAddress(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_GET_SIGNATURES_FOR_ADDRESS:
      return await handleGetSignaturesForAddress(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_CONNECTION_RPC_GET_NONCE_AND_CONTEXT:
      return await handleGetNonceAndContext(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_GET_NONCE:
      return await handleGetNonce(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_REQUEST_AIRDROP:
      return await handleRequestAirdrop(ctx, params[0], params[1]);
    case SOLANA_CONNECTION_RPC_SEND_ENCODED_TRANSACTION:
      return await handleSendEncodedTransaction(ctx, params[0], params[1]);
    default:
      throw new Error("invalid rpc method");
  }
}

async function handleGetMultipleAccountsInfo(
  ctx: Context<SolanaConnectionBackend>,
  pubkeys: string[],
  commitment?: Commitment
) {
  const resp = await ctx.backend.getMultipleAccountsInfo(
    pubkeys.map((k) => new PublicKey(k)),
    commitment
  );
  return [resp];
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
  return [resp];
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
  filter: TokenAccountsFilter,
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
  commitment?: Commitment
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

  const resp = await ctx.backend.confirmTransaction(signature, commitment);
  return [resp];
}

/*
async function handleSimulateTransaction(
  ctx: Context<SolanaConnectionBackend>,
  transactionOrMessage: string,
  configOrSigners?: Array<Signer> | SimulateTransactionConfig,
  includeAccounts?: boolean | Array<PublicKey>
  ) {
    const resp = await ctx.backend.simulateTransaction(
      transactionOrMessage,
      configOrSigners,
      includeAccounts
    );
  return [resp];
}
*/

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
  commitment?: Finality
) {
  const resp = await ctx.backend.getParsedTransaction(signature, commitment);
  return [resp];
}

async function handleGetParsedTransactions(
  ctx: Context<SolanaConnectionBackend>,
  signatures: TransactionSignature[],
  commitment?: Finality
) {
  const resp = await ctx.backend.getParsedTransactions(signatures, commitment);
  return [resp];
}

async function handleCustomSplTokenAccounts(
  ctx: Context<SolanaConnectionBackend>,
  pubkey: string
) {
  const _resp = await ctx.backend.customSplTokenAccounts(new PublicKey(pubkey));
  const resp = {
    ..._resp,
    tokenAccountsMap: _resp.tokenAccountsMap.map((t: any) => {
      return [
        t[0],
        {
          ...t[1],
          mint: t[1].mint.toString(),
        },
      ];
    }),
  };
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
  pubkey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getBalance(new PublicKey(pubkey), commitment);
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
  pubkey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getParsedAccountInfo(
    new PublicKey(pubkey),
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

async function handleGetBalanceAndContext(
  ctx: Context<SolanaConnectionBackend>,
  pubkey: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getBalanceAndContext(
    new PublicKey(pubkey),
    commitment
  );
  return [resp];
}

async function handleGetMinimumLedgerSlot(
  ctx: Context<SolanaConnectionBackend>
) {
  const resp = await ctx.backend.getMinimumLedgerSlot();
  return [resp];
}

async function handleGetFirstAvailableBlock(
  ctx: Context<SolanaConnectionBackend>
) {
  const resp = await ctx.backend.getFirstAvailableBlock();
  return [resp];
}

async function handleGetSupply(
  ctx: Context<SolanaConnectionBackend>,
  config?: GetSupplyConfig | Commitment
) {
  const resp = await ctx.backend.getSupply(config);
  return [resp];
}

async function handleGetTokenSupply(
  ctx: Context<SolanaConnectionBackend>,
  tokenMintAddress: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getTokenSupply(
    new PublicKey(tokenMintAddress),
    commitment
  );
  return [resp];
}

async function handleGetLargestAccounts(
  ctx: Context<SolanaConnectionBackend>,
  config?: GetLargestAccountsConfig
) {
  const resp = await ctx.backend.getLargestAccounts(config);
  return [resp];
}

async function handleGetMultipleAccountsInfoAndContext(
  ctx: Context<SolanaConnectionBackend>,
  pubkeys: string[],
  commitment?: Commitment
) {
  const resp = await ctx.backend.getMultipleAccountsInfoAndContext(
    pubkeys.map((k) => new PublicKey(k)),
    commitment
  );
  return [resp];
}

async function handleGetStakeActivation(
  ctx: Context<SolanaConnectionBackend>,
  pubkey: string,
  commitment?: Commitment,
  epoch?: number
) {
  const resp = await ctx.backend.getStakeActivation(
    new PublicKey(pubkey),
    commitment,
    epoch
  );
  return [resp];
}

async function handleGetClusterNodes(ctx: Context<SolanaConnectionBackend>) {
  const resp = await ctx.backend.getClusterNodes();
  return [resp];
}

async function handleGetVoteAccounts(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getVoteAccounts(commitment);
  return [resp];
}

async function handleGetSlotLeader(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getSlotLeader(commitment);
  return [resp];
}

async function handleGetSlotLeaders(
  ctx: Context<SolanaConnectionBackend>,
  startSlot: number,
  limit: number
) {
  const resp = await ctx.backend.getSlotLeaders(startSlot, limit);
  return [resp];
}

async function handleGetSignatureStatus(
  ctx: Context<SolanaConnectionBackend>,
  signature: TransactionSignature,
  config?: SignatureStatusConfig
) {
  const resp = await ctx.backend.getSignatureStatus(signature, config);
  return [resp];
}

async function handleGetSignatureStatuses(
  ctx: Context<SolanaConnectionBackend>,
  signatures: Array<TransactionSignature>,
  config?: SignatureStatusConfig
) {
  const resp = await ctx.backend.getSignatureStatuses(signatures, config);
  return [resp];
}

async function handleGetTransactionCount(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getTransactionCount(commitment);
  return [resp];
}

async function handleGetTotalSupply(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getTotalSupply(commitment);
  return [resp];
}

async function handleGetInflationGovernor(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getInflationGovernor(commitment);
  return [resp];
}

async function handleGetInflationReward(
  ctx: Context<SolanaConnectionBackend>,
  addresses: string[],
  epoch?: number,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getInflationReward(
    addresses.map((k) => new PublicKey(k)),
    epoch,
    commitment
  );
  return [resp];
}

async function handleGetEpochInfo(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getEpochInfo(commitment);
  return [resp];
}

async function handleGetEpochSchedule(ctx: Context<SolanaConnectionBackend>) {
  const resp = await ctx.backend.getEpochSchedule();
  return [resp];
}

async function handleGetLeaderSchedule(ctx: Context<SolanaConnectionBackend>) {
  const resp = await ctx.backend.getLeaderSchedule();
  return [resp];
}

async function handleGetRecentBlockhashAndContext(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getRecentBlockhashAndContext(commitment);
  return [resp];
}

async function handleGetRecentPerformanceSamples(
  ctx: Context<SolanaConnectionBackend>,
  limit?: number
) {
  const resp = await ctx.backend.getRecentPerformanceSamples(limit);
  return [resp];
}

async function handleGetFeeCalculatorForBlockhash(
  ctx: Context<SolanaConnectionBackend>,
  blockhash: Blockhash,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getFeeCalculatorForBlockhash(
    blockhash,
    commitment
  );
  return [resp];
}

async function handleGetRecentBlockhash(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getRecentBlockhash(commitment);
  return [resp];
}

async function handleGetVersion(ctx: Context<SolanaConnectionBackend>) {
  const resp = await ctx.backend.getVersion();
  return [resp];
}

async function handleGetGenesisHash(ctx: Context<SolanaConnectionBackend>) {
  const resp = await ctx.backend.getGenesisHash();
  return [resp];
}

async function handleGetBlock(
  ctx: Context<SolanaConnectionBackend>,
  slot: number,
  opts?: {
    commitment?: Finality;
  }
) {
  const resp = await ctx.backend.getBlock(slot, opts);
  return [resp];
}

async function handleGetBlockHeight(
  ctx: Context<SolanaConnectionBackend>,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getBlockHeight(commitment);
  return [resp];
}

async function handleGetBlockProduction(
  ctx: Context<SolanaConnectionBackend>,
  configOrCommitment?: GetBlockProductionConfig | Commitment
) {
  const resp = await ctx.backend.getBlockProduction(configOrCommitment);
  return [resp];
}

async function handleGetTransaction(
  ctx: Context<SolanaConnectionBackend>,
  signature: string,
  opts?: {
    commitment?: Finality;
  }
) {
  const resp = await ctx.backend.getTransaction(signature, opts);
  return [resp];
}

async function handleGetConfirmedBlock(
  ctx: Context<SolanaConnectionBackend>,
  slot: number,
  commitment?: Finality
) {
  const resp = await ctx.backend.getConfirmedBlock(slot, commitment);
  return [resp];
}

async function handleGetBlocks(
  ctx: Context<SolanaConnectionBackend>,
  startSlot: number,
  endSlot?: number,
  commitment?: Finality
) {
  const resp = await ctx.backend.getBlocks(startSlot, endSlot, commitment);
  return [resp];
}

async function handleGetBlockSignatures(
  ctx: Context<SolanaConnectionBackend>,
  slot: number,
  commitment?: Finality
) {
  const resp = await ctx.backend.getBlockSignatures(slot, commitment);
  return [resp];
}

async function handleGetConfirmedBlockSignatures(
  ctx: Context<SolanaConnectionBackend>,
  slot: number,
  commitment?: Finality
) {
  const resp = await ctx.backend.getConfirmedBlockSignatures(slot, commitment);
  return [resp];
}

async function handleGetConfirmedTransaction(
  ctx: Context<SolanaConnectionBackend>,
  signature: TransactionSignature,
  commitment?: Finality
) {
  const resp = await ctx.backend.getConfirmedTransaction(signature, commitment);
  return [resp];
}

async function handleGetParsedConfirmedTransaction(
  ctx: Context<SolanaConnectionBackend>,
  signature: TransactionSignature,
  commitment?: Finality
) {
  const resp = await ctx.backend.getParsedConfirmedTransaction(
    signature,
    commitment
  );
  return [resp];
}

async function handleGetParsedConfirmedTransactions(
  ctx: Context<SolanaConnectionBackend>,
  signatures: TransactionSignature[],
  commitment?: Finality
) {
  const resp = await ctx.backend.getParsedConfirmedTransactions(
    signatures,
    commitment
  );
  return [resp];
}

async function handleGetConfirmedSignaturesForAddress(
  ctx: Context<SolanaConnectionBackend>,
  address: string,
  startSlot: number,
  endSlot: number
) {
  const resp = await ctx.backend.getConfirmedSignaturesForAddress(
    new PublicKey(address),
    startSlot,
    endSlot
  );
  return [resp];
}

async function handleGetSignaturesForAddress(
  ctx: Context<SolanaConnectionBackend>,
  address: string,
  options?: SignaturesForAddressOptions,
  commitment?: Finality
) {
  const resp = await ctx.backend.getSignaturesForAddress(
    new PublicKey(address),
    options,
    commitment
  );
  return [resp];
}

async function handleGetNonceAndContext(
  ctx: Context<SolanaConnectionBackend>,
  nonceAccount: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getNonceAndContext(
    new PublicKey(nonceAccount),
    commitment
  );
  return [resp];
}

async function handleGetNonce(
  ctx: Context<SolanaConnectionBackend>,
  nonceAccount: string,
  commitment?: Commitment
) {
  const resp = await ctx.backend.getNonce(
    new PublicKey(nonceAccount),
    commitment
  );
  return [resp];
}

async function handleRequestAirdrop(
  ctx: Context<SolanaConnectionBackend>,
  to: string,
  lamports: number
) {
  const resp = await ctx.backend.requestAirdrop(new PublicKey(to), lamports);
  return [resp];
}

async function handleSendEncodedTransaction(
  ctx: Context<SolanaConnectionBackend>,
  encodedTransaction: string,
  options?: SendOptions
) {
  const resp = await ctx.backend.sendEncodedTransaction(
    encodedTransaction,
    options
  );
  return [resp];
}
