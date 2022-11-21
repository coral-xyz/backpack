import type {
  Commitment,
  TransactionSignature,
  SendOptions,
  Finality,
  ConfirmedSignaturesForAddress2Options,
  GetProgramAccountsConfig,
  MessageArgs,
  BlockheightBasedTransactionConfirmationStrategy,
  GetParsedProgramAccountsConfig,
} from "@solana/web3.js";
import {
  PublicKey,
  Message,
  GetAccountInfoConfig,
  VersionedMessage,
} from "@solana/web3.js";
import type {
  SerializedTokenAccountsFilter,
  RpcRequest,
  RpcResponse,
  Context,
  EventEmitter,
} from "@coral-xyz/common";
import {
  getLogger,
  withContext,
  withContextPort,
  deserializeTokenAccountsFilter,
  ChannelAppUi,
  ChannelContentScript,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_RPC_UI,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  //SOLANA_CONNECTION_RPC_SIMULATE_TRANSACTION,
  //SOLANA_CONNECTION_RPC_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
  SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE,
  SOLANA_CONNECTION_RPC_GET_BALANCE,
  SOLANA_CONNECTION_RPC_GET_SLOT,
  SOLANA_CONNECTION_RPC_GET_BLOCK_TIME,
  SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE,
  /*SOLANA_CONNECTION_RPC_GET_BALANCE_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_MINIMUM_LEDGER_SLOT,
  SOLANA_CONNECTION_RPC_GET_FIRST_AVAILABLE_BLOCK,
  SOLANA_CONNECTION_RPC_GET_SUPPLY,
  SOLANA_CONNECTION_RPC_GET_TOKEN_SUPPLY,
  SOLANA_CONNECTION_RPC_GET_LARGEST_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_MULTIPLE_ACCOUNTS_INFO_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_STAKE_ACTIVATION,
  SOLANA_CONNECTION_RPC_GET_CLUSTER_NODES,
  SOLANA_CONNECTION_RPC_GET_VOTE_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_SLOT_LEADER,
  SOLANA_CONNECTION_RPC_GET_SLOT_LEADERS,
  SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUS,
  SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUSES,
  SOLANA_CONNECTION_RPC_GET_TRANSACTION_COUNT,
  SOLANA_CONNECTION_RPC_GET_TOTAL_SUPPLY,
  SOLANA_CONNECTION_RPC_GET_INFLATION_GOVERNOR,
  SOLANA_CONNECTION_RPC_GET_INFLATION_REWARD,
  SOLANA_CONNECTION_RPC_GET_EPOCH_INFO,
  SOLANA_CONNECTION_RPC_GET_EPOCH_SCHEDULE,
  SOLANA_CONNECTION_RPC_GET_LEADER_SCHEDULE,
  SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_RECENT_PERFORMANCE_SAMPLES,
  SOLANA_CONNECTION_RPC_GET_FEE_CALCULATOR_FOR_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_VERSION,
  SOLANA_CONNECTION_RPC_GET_GENESIS_HASH,
  SOLANA_CONNECTION_RPC_GET_BLOCK,
  SOLANA_CONNECTION_RPC_GET_BLOCK_HEIGHT,
  SOLANA_CONNECTION_RPC_GET_BLOCK_PRODUCTION,
  SOLANA_CONNECTION_RPC_GET_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK,
  SOLANA_CONNECTION_RPC_GET_BLOCKS,
  SOLANA_CONNECTION_RPC_GET_BLOCK_SIGNATURES,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK_SIGNATURES,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS,
  SOLANA_CONNECTION_RPC_GET_SIGNATURES_FOR_ADDRESS,
  SOLANA_CONNECTION_RPC_GET_NONCE_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_NONCE,
  SOLANA_CONNECTION_RPC_REQUEST_AIRDROP,
  SOLANA_CONNECTION_RPC_SEND_TRANSACTION,
  SOLANA_CONNECTION_RPC_SEND_ENCODED_TRANSACTION,
  */
  addressLookupTableAccountParser,
  deserializeTransaction,
} from "@coral-xyz/common";
import type { SolanaConnectionBackend } from "../backend/solana-connection";
import type { Config, Handle } from "../types";
import * as bs58 from "bs58";
import { decode } from "bs58";

const logger = getLogger("solana-connection");
const messageHandlers: Map<string, Function> = new Map();

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

  const func = messageHandlers.get(method);
  if (!func) throw new Error("invalid rpc method");

  return func(ctx, params);
}

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  async (ctx: Context<SolanaConnectionBackend>, params) => {
    const resp = await ctx.backend.getAccountInfo(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
  async (ctx: Context<SolanaConnectionBackend>, params) => {
    const resp = await ctx.backend.getAccountInfoAndContext(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  async (ctx, params) => {
    const resp = await ctx.backend.getLatestBlockhash(params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT,
  async (ctx, params) => {
    const resp = await ctx.backend.getLatestBlockhashAndContext(params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  async (ctx: Context<SolanaConnectionBackend>, params) => {
    const filter = params[1];
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
      new PublicKey(params[0]),
      _filter,
      params[2]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  async (ctx, params) => {
    const tx = deserializeTransaction(params[0]);
    const serializedTx = tx.serialize();
    const resp = await ctx.backend.sendRawTransaction(serializedTx, params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  async (ctx, params) => {
    let signature = params[0];
    if (typeof signature === "string") {
      const { blockhash, lastValidBlockHeight } =
        await ctx.backend.getLatestBlockhash();
      signature = {
        signature,
        blockhash,
        lastValidBlockHeight,
      };
    }

    const resp = await ctx.backend.confirmTransaction(signature, params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  async (ctx, params) => {
    const resp = await ctx.backend.getMultipleAccountsInfo(
      params[0].map((p) => new PublicKey(p)),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  async (ctx, params) => {
    const resp = await ctx.backend.getConfirmedSignaturesForAddress2(
      new PublicKey(params[0]),
      params[1],
      params[2]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  async (ctx, params) => {
    const resp = await ctx.backend.getParsedTransaction(params[0], params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  async (ctx, params) => {
    const resp = await ctx.backend.getParsedTransactions(params[0], params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  async (ctx, params) => {
    const _resp = await ctx.backend.customSplTokenAccounts(
      new PublicKey(params[0])
    );
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
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
  async (ctx, params) => {
    const resp = await ctx.backend.getProgramAccounts(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
  async (ctx, params) => {
    const message = VersionedMessage.deserialize(decode(params[0]));
    const resp = await ctx.backend.getFeeForMessage(message, params[1]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
  async (ctx, params) => {
    const resp = await ctx.backend.getMinimumBalanceForRentExemption(
      params[0],
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE,
  async (ctx, params) => {
    const resp = await ctx.backend.getTokenAccountBalance(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(SOLANA_CONNECTION_RPC_GET_BALANCE, async (ctx, params) => {
  const resp = await ctx.backend.getBalance(
    new PublicKey(params[0]),
    params[1]
  );
  return [resp];
});

messageHandlers.set(SOLANA_CONNECTION_RPC_GET_SLOT, async (ctx, params) => {
  const resp = await ctx.backend.getSlot(params[0]);
  return [resp];
});

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_BLOCK_TIME,
  async (ctx, params) => {
    const resp = await ctx.backend.getBlockTime(params[0]);
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER,
  async (ctx, params) => {
    const resp = await ctx.backend.getParsedTokenAccountsByOwner(
      new PublicKey(params[0]),
      deserializeTokenAccountsFilter(params[1]),
      params[2]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS,
  async (ctx, params) => {
    const resp = await ctx.backend.getTokenLargestAccounts(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO,
  async (ctx, params) => {
    const resp = await ctx.backend.getParsedAccountInfo(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS,
  async (ctx, params) => {
    const resp = await ctx.backend.getParsedProgramAccounts(
      new PublicKey(params[0]),
      params[1]
    );
    return [resp];
  }
);

messageHandlers.set(
  SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE,
  async (ctx, params) => {
    const resp = await ctx.backend.getAddressLookupTable(
      new PublicKey(params[0]),
      params[1]
    );
    // @ts-ignore
    resp.value = addressLookupTableAccountParser.serialize(resp.value);
    return [resp];
  }
);
