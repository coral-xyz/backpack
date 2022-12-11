import type {
  AccountBalancePair,
  AccountChangeCallback,
  AccountInfo,
  AddressLookupTableAccount,
  Blockhash,
  BlockheightBasedTransactionConfirmationStrategy,
  BlockProduction,
  BlockResponse,
  BlockSignatures,
  Commitment,
  ConfirmedBlock,
  ConfirmedSignatureInfo,
  ConfirmedSignaturesForAddress2Options,
  ConfirmedTransaction,
  ConnectionConfig,
  ContactInfo,
  EpochInfo,
  EpochSchedule,
  FeeCalculator,
  Finality,
  GetAccountInfoConfig,
  GetBlockProductionConfig,
  GetLargestAccountsConfig,
  GetParsedProgramAccountsConfig,
  GetProgramAccountsConfig,
  GetProgramAccountsFilter,
  GetSupplyConfig,
  InflationGovernor,
  InflationReward,
  LeaderSchedule,
  LogsCallback,
  LogsFilter,
  Message,
  NonceAccount,
  ParsedAccountData,
  ParsedConfirmedTransaction,
  PerfSample,
  ProgramAccountChangeCallback,
  RootChangeCallback,
  RpcResponseAndContext,
  SendOptions,
  SignatureResult,
  SignatureResultCallback,
  SignaturesForAddressOptions,
  SignatureStatus,
  SignatureStatusConfig,
  SignatureSubscriptionCallback,
  SignatureSubscriptionOptions,
  Signer,
  SimulatedTransactionResponse,
  SimulateTransactionConfig,
  SlotChangeCallback,
  SlotUpdateCallback,
  StakeActivationData,
  Supply,
  TokenAccountBalancePair,
  TokenAccountsFilter,
  TokenAmount,
  Transaction,
  TransactionResponse,
  TransactionSignature,
  Version,
  VersionedMessage,
  VersionedTransaction,
  VoteAccountStatus,
} from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { encode } from "bs58";
import { Buffer } from "buffer";

import type { BackgroundClient } from "../channel";
import {
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE,
  SOLANA_CONNECTION_RPC_GET_BALANCE,
  SOLANA_CONNECTION_RPC_GET_BLOCK_TIME,
  SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,  
  SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
  SOLANA_CONNECTION_RPC_GET_BALANCE_AND_CONTEXT,
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
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE,
  SOLANA_CONNECTION_RPC_GET_SLOT,
  SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS,
  SOLANA_CONNECTION_RPC_SIMULATE_TRANSACTION,
} from "../constants";

import { addressLookupTableAccountParser } from "./rpc-helpers";
import type {
  SolanaTokenAccountWithKey,
  SolanaTokenAccountWithKeyString,
  SplNftMetadata,
  SplNftMetadataString,
  TokenMetadata,
  TokenMetadataString,
} from "./types";
import { serializeTokenAccountsFilter } from "./types";

export class BackgroundSolanaConnection extends Connection {
  private _backgroundClient: BackgroundClient;

  // Note that this constructor is actually meaningless.
  // We only use it so that we can subclass Connection.
  // In reality, the params here are actually read in the context of the
  // background script.
  constructor(
    backgroundClient: BackgroundClient,
    endpoint: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super(endpoint, commitmentOrConfig);
    this._backgroundClient = backgroundClient;
  }

  async customSplTokenAccounts(publicKey: PublicKey): Promise<{
    tokenAccountsMap: [string, SolanaTokenAccountWithKeyString][];
    tokenMetadata: (TokenMetadataString | null)[];
    nftMetadata: [string, SplNftMetadataString][];
  }> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
      params: [publicKey.toString()],
    });
    const _resp =
      BackgroundSolanaConnection.customSplTokenAccountsFromJson(resp);
    return _resp;
  }

  static customSplTokenAccountsFromJson(json: any) {
    return {
      ...json,
      tokenAccountsMap: json.tokenAccountsMap.map((t: any) => {
        return [
          t[0],
          {
            ...t[1],
            amount: new BN(t[1].amount),
          },
        ];
      }),
    };
  }

  async getMultipleAccountsInfo(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<(AccountInfo<Buffer> | null)[]> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
      params: [publicKeys.map((pk) => pk.toString()), commitment],
    });
    return resp.map((a: any) => {
      if (a === null) {
        return a;
      }
      a.data = Buffer.from(a.data);
      a.owner = new PublicKey(a.owner.toString());
      return a;
    });
  }

  async getAccountInfo(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<AccountInfo<Buffer> | null> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
      params: [publicKey.toString(), commitment],
    });
    if (resp === null) {
      return resp;
    }
    resp.data = Buffer.from(resp.data);
    resp.owner = new PublicKey(resp.owner);
    return resp;
  }

  async getAccountInfoAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<AccountInfo<Buffer> | null>> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
      params: [publicKey.toString(), commitment],
    });
  }

  async getLatestBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    lastValidBlockHeight: number;
  }> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
      params: [commitment],
    });
  }

  async getLatestBlockhashAndContext(commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      lastValidBlockHeight: number;
    }>
  > {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT,
      params: [commitment],
    });
  }

  async getTokenAccountsByOwner(
    ownerAddress: PublicKey,
    filter: TokenAccountsFilter,
    commitment?: Commitment
  ): Promise<
    RpcResponseAndContext<
      Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
      }>
    >
  > {
    let _filter;
    // @ts-ignore
    if (filter.mint) {
      // @ts-ignore
      _filter = { mint: filter.mint.toString() };
    } else {
      // @ts-ignore
      _filter = { programId: filter.programId.toString() };
    }
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
      params: [ownerAddress.toString(), _filter, commitment],
    });
    resp.value = resp.value.map((token: any) => {
      token.account.data = Buffer.from(token.account.data);
      return token;
    });
    return resp;
  }

  async sendRawTransaction(
    rawTransaction: Buffer | Uint8Array | Array<number>,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    const txStr = encode(rawTransaction);
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
      params: [txStr, options],
    });
  }

  async getConfirmedSignaturesForAddress2(
    address: PublicKey,
    options?: ConfirmedSignaturesForAddress2Options,
    commitment?: Finality
  ): Promise<Array<ConfirmedSignatureInfo>> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
      params: [address.toString(), options, commitment],
    });
  }

  async getParsedTransactions(
    signatures: TransactionSignature[],
    commitment?: Finality
  ): Promise<(ParsedConfirmedTransaction | null)[]> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
      params: [signatures, commitment],
    });
  }

  async confirmTransaction(
    strategy: BlockheightBasedTransactionConfirmationStrategy | string,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<SignatureResult>> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
      params: [strategy, commitment],
    });
  }

  async getParsedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ParsedConfirmedTransaction | null> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
      params: [signature, commitment],
    });
  }

  async getProgramAccounts(
    programId: PublicKey,
    configOrCommitment?: GetProgramAccountsConfig | Commitment
  ): Promise<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<Buffer>;
    }>
  > {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
      params: [programId.toString(), configOrCommitment],
    });
    return resp.map((r) => {
      r.account.data = Buffer.from(r.account.data.data);
      return r;
    });
  }

  async getFeeForMessage(
    message: VersionedMessage,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<number>> {
    let serializedMessage = encode(message.serialize());
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE,
      params: [serializedMessage, commitment],
    });
  }

  async getMinimumBalanceForRentExemption(
    dataLength: number,
    commitment?: Commitment
  ): Promise<number> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
      params: [dataLength, commitment],
    });
  }

  async getTokenAccountBalance(
    tokenAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE,
      params: [tokenAddress.toString(), commitment],
    });
  }

  async getBalance(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<number> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BALANCE,
      params: [publicKey.toString(), commitment],
    });
  }

  async getSlot(commitment?: Commitment): Promise<number> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SLOT,
      params: [commitment],
    });
  }

  async getBlockTime(slot: number): Promise<number | null> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BLOCK_TIME,
      params: [slot],
    });
  }

  async getParsedTokenAccountsByOwner(
    ownerAddress: PublicKey,
    filter: TokenAccountsFilter,
    commitment?: Commitment
  ): Promise<
    RpcResponseAndContext<
      Array<{
        pubkey: PublicKey;
        account: AccountInfo<ParsedAccountData>;
      }>
    >
  > {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER,
      params: [
        ownerAddress.toString(),
        serializeTokenAccountsFilter(filter),
        commitment,
      ],
    });
    resp.value = resp.value.map(({ pubkey, account }) => {
      return {
        pubkey: new PublicKey(pubkey),
        account: {
          ...account,
          owner: new PublicKey(account.owner),
        },
      };
    });
    return resp;
  }

  async getTokenLargestAccounts(
    mintAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<Array<TokenAccountBalancePair>>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS,
      params: [mintAddress.toString(), commitment],
    });
    resp.value = resp.value.map((val) => {
      return {
        ...val,
        address: new PublicKey(val.address),
      };
    });
    return resp;
  }

  async getAddressLookupTable(
    accountKey: PublicKey,
    config?: GetAccountInfoConfig
  ): Promise<RpcResponseAndContext<AddressLookupTableAccount | null>> {
    const response = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE,
      params: [accountKey.toString(), config],
    });
    response.value = addressLookupTableAccountParser.deserialize(
      response.value
    );
    return response;
  }

  async getParsedAccountInfo(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<
    RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>
  > {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO,
      params: [publicKey.toString(), commitment],
    });
    return resp;
  }

  async getParsedProgramAccounts(
    programId: PublicKey,
    configOrCommitment?: GetParsedProgramAccountsConfig | Commitment
  ): Promise<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<Buffer | ParsedAccountData>;
    }>
  > {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS,
      params: [programId.toString(), configOrCommitment],
    });
    return resp.map((val) => {
      return {
        pubkey: new PublicKey(val.pubkey),
        account: {
          ...val.account,
          owner: new PublicKey(val.account.owner),
          data: Buffer.from(val.account.data.data),
        },
      };
    });
  }

  async getBalanceAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<number>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BALANCE_AND_CONTEXT,
      params: [publicKey.toString(), commitment],
    });
    return resp;
  }

  async getMinimumLedgerSlot(): Promise<number> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_MINIMUM_LEDGER_SLOT,
      params: [],
    });
    return resp;
  }

  async getFirstAvailableBlock(): Promise<number> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_FIRST_AVAILABLE_BLOCK,
      params: [],
    });
    return resp;
  }

  async getSupply(
    config?: GetSupplyConfig | Commitment
  ): Promise<RpcResponseAndContext<Supply>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SUPPLY,
      params: [config],
    });
    return resp;
  }

  async getTokenSupply(
    tokenMintAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TOKEN_SUPPLY,
      params: [tokenMintAddress.toString(), commitment],
    });
    return resp;
  }

  async getLargestAccounts(
    config?: GetLargestAccountsConfig
  ): Promise<RpcResponseAndContext<Array<AccountBalancePair>>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_LARGEST_ACCOUNTS,
      params: [config],
    });
    return resp;
  }

  async getMultipleAccountsInfoAndContext(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<(AccountInfo<Buffer> | null)[]>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_MULTIPLE_ACCOUNTS_INFO_AND_CONTEXT,
      params: [publicKeys.map((k) => k.toString()), commitment],
    });
    return resp;
  }

  async getStakeActivation(
    publicKey: PublicKey,
    commitment?: Commitment,
    epoch?: number
  ): Promise<StakeActivationData> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_STAKE_ACTIVATION,
      params: [publicKey.toString(), commitment, epoch],
    });
    return resp;
  }

  async getClusterNodes(): Promise<Array<ContactInfo>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_CLUSTER_NODES,
      params: [],
    });
    return resp;
  }

  async getVoteAccounts(commitment?: Commitment): Promise<VoteAccountStatus> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_VOTE_ACCOUNTS,
      params: [commitment],
    });
    return resp;
  }

  async getSlotLeader(commitment?: Commitment): Promise<string> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SLOT_LEADER,
      params: [commitment],
    });
    return resp;
  }

  async getSlotLeaders(
    startSlot: number,
    limit: number
  ): Promise<Array<PublicKey>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SLOT_LEADERS,
      params: [startSlot, limit],
    });
    return resp;
  }

  async getSignatureStatus(
    signature: TransactionSignature,
    config?: SignatureStatusConfig
  ): Promise<RpcResponseAndContext<SignatureStatus | null>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUS,
      params: [signature, config],
    });
    return resp;
  }

  async getSignatureStatuses(
    signatures: Array<TransactionSignature>,
    config?: SignatureStatusConfig
  ): Promise<RpcResponseAndContext<Array<SignatureStatus | null>>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SIGNATURE_STATUSES,
      params: [signatures, config],
    });
    return resp;
  }

  async getTransactionCount(commitment?: Commitment): Promise<number> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TRANSACTION_COUNT,
      params: [commitment],
    });
    return resp;
  }

  async getTotalSupply(commitment?: Commitment): Promise<number> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TOTAL_SUPPLY,
      params: [commitment],
    });
    return resp;
  }

  async getInflationGovernor(
    commitment?: Commitment
  ): Promise<InflationGovernor> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_INFLATION_GOVERNOR,
      params: [commitment],
    });
    return resp;
  }

  async getInflationReward(
    addresses: PublicKey[],
    epoch?: number,
    commitment?: Commitment
  ): Promise<(InflationReward | null)[]> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_INFLATION_REWARD,
      params: [addresses.map((k) => k.toString()), epoch, commitment],
    });
    return resp;
  }

  async getEpochInfo(commitment?: Commitment): Promise<EpochInfo> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_EPOCH_INFO,
      params: [commitment],
    });
    return resp;
  }

  async getEpochSchedule(): Promise<EpochSchedule> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_EPOCH_SCHEDULE,
      params: [],
    });
    return resp;
  }

  async getLeaderSchedule(): Promise<LeaderSchedule> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_LEADER_SCHEDULE,
      params: [],
    });
    return resp;
  }

  async getRecentBlockhashAndContext(commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    }>
  > {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH_AND_CONTEXT,
      params: [commitment],
    });
    return resp;
  }

  async getRecentPerformanceSamples(
    limit?: number
  ): Promise<Array<PerfSample>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_RECENT_PERFORMANCE_SAMPLES,
      params: [limit],
    });
    return resp;
  }

  async getFeeCalculatorForBlockhash(
    blockhash: Blockhash,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<FeeCalculator | null>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_FEE_CALCULATOR_FOR_BLOCKHASH,
      params: [blockhash, commitment],
    });
    return resp;
  }

  async getRecentBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
  }> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_RECENT_BLOCKHASH,
      params: [commitment],
    });
    return resp;
  }

  async getVersion(): Promise<Version> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_VERSION,
      params: [],
    });
    return resp;
  }

  async getGenesisHash(): Promise<string> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_GENESIS_HASH,
      params: [],
    });
    return resp;
  }

  async getBlock(
    slot: number,
    opts?: {
      commitment?: Finality;
    }
  ): Promise<BlockResponse | null> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BLOCK,
      params: [slot, opts],
    });
    return resp;
  }

  async getBlockHeight(commitment?: Commitment): Promise<number> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BLOCK_HEIGHT,
      params: [commitment],
    });
    return resp;
  }

  async getBlockProduction(
    configOrCommitment?: GetBlockProductionConfig | Commitment
  ): Promise<RpcResponseAndContext<BlockProduction>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BLOCK_PRODUCTION,
      params: [configOrCommitment],
    });
    return resp;
  }

  async getTransaction(
    signature: string,
    opts?: {
      commitment?: Finality;
    }
  ): Promise<TransactionResponse | null> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_TRANSACTION,
      params: [signature, opts],
    });
    return resp;
  }

  async getConfirmedBlock(
    slot: number,
    commitment?: Finality
  ): Promise<ConfirmedBlock> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK,
      params: [slot, commitment],
    });
    return resp;
  }

  async getBlocks(
    startSlot: number,
    endSlot?: number,
    commitment?: Finality
  ): Promise<Array<number>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BLOCKS,
      params: [startSlot, endSlot, commitment],
    });
    return resp;
  }

  async getBlockSignatures(
    slot: number,
    commitment?: Finality
  ): Promise<BlockSignatures> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_BLOCK_SIGNATURES,
      params: [slot, commitment],
    });
    return resp;
  }

  async getConfirmedBlockSignatures(
    slot: number,
    commitment?: Finality
  ): Promise<BlockSignatures> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_CONFIRMED_BLOCK_SIGNATURES,
      params: [slot, commitment],
    });
    return resp;
  }

  async getConfirmedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ConfirmedTransaction | null> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_CONFIRMED_TRANSACTION,
      params: [signature, commitment],
    });
    return resp;
  }

  async getParsedConfirmedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ParsedConfirmedTransaction | null> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTION,
      params: [signature, commitment],
    });
    return resp;
  }

  async getParsedConfirmedTransactions(
    signatures: TransactionSignature[],
    commitment?: Finality
  ): Promise<(ParsedConfirmedTransaction | null)[]> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_CONFIRMED_TRANSACTIONS,
      params: [signatures, commitment],
    });
    return resp;
  }

  async getConfirmedSignaturesForAddress(
    address: PublicKey,
    startSlot: number,
    endSlot: number
  ): Promise<Array<TransactionSignature>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS,
      params: [address.toString(), startSlot, endSlot],
    });
    return resp;
  }

  async getSignaturesForAddress(
    address: PublicKey,
    options?: SignaturesForAddressOptions,
    commitment?: Finality
  ): Promise<Array<ConfirmedSignatureInfo>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_SIGNATURES_FOR_ADDRESS,
      params: [address.toString(), options, commitment],
    });
    return resp;
  }

  async getNonceAndContext(
    nonceAccount: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<NonceAccount | null>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_NONCE_AND_CONTEXT,
      params: [nonceAccount.toString(), commitment],
    });
    return resp;
  }

  async getNonce(
    nonceAccount: PublicKey,
    commitment?: Commitment
  ): Promise<NonceAccount | null> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_NONCE,
      params: [nonceAccount.toString(), commitment],
    });
    return resp;
  }

  async requestAirdrop(
    to: PublicKey,
    lamports: number
  ): Promise<TransactionSignature> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_REQUEST_AIRDROP,
      params: [to.toString(), lamports],
    });
    return resp;
  }

  async sendTransaction(
    transaction: VersionedTransaction | Transaction,
    signersOrOptions?: Array<Signer> | SendOptions,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_SEND_TRANSACTION,
      params: [transaction, signersOrOptions, options],
    });
    return resp;
  }

  async simulateTransaction(
    transactionOrMessage: VersionedTransaction | Transaction | Message,
    configOrSigners?: SimulateTransactionConfig | Array<Signer>,
    includeAccounts?: boolean | Array<PublicKey>
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_SIMULATE_TRANSACTION,
      params: [transactionOrMessage, configOrSigners, includeAccounts],
    });
    return resp;
  }

  async sendEncodedTransaction(
    encodedTransaction: string,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_SEND_ENCODED_TRANSACTION,
      params: [encodedTransaction, options],
    });
    return resp;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Below this not yet implemented.
  ///////////////////////////////////////////////////////////////////////////////

  onAccountChange(
    publicKey: PublicKey,
    callback: AccountChangeCallback,
    commitment?: Commitment
  ): number {
    throw new Error("not implemented");
  }

  removeAccountChangeListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }

  onProgramAccountChange(
    programId: PublicKey,
    callback: ProgramAccountChangeCallback,
    commitment?: Commitment,
    filters?: GetProgramAccountsFilter[]
  ): number {
    throw new Error("not implemented");
  }

  removeProgramAccountChangeListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }

  onLogs(
    filter: LogsFilter,
    callback: LogsCallback,
    commitment?: Commitment
  ): number {
    throw new Error("not implemented");
  }

  removeOnLogsListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }

  onSlotChange(callback: SlotChangeCallback): number {
    throw new Error("not implemented");
  }

  removeSlotChangeListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }

  onSlotUpdate(callback: SlotUpdateCallback): number {
    throw new Error("not implemented");
  }

  removeSlotUpdateListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }
  _buildArgs(
    args: Array<any>,
    override?: Commitment,
    encoding?: "jsonParsed" | "base64",
    extra?: any
  ): Array<any> {
    throw new Error("not implemented");
  }

  onSignature(
    signature: TransactionSignature,
    callback: SignatureResultCallback,
    commitment?: Commitment
  ): number {
    throw new Error("not implemented");
  }

  onSignatureWithOptions(
    signature: TransactionSignature,
    callback: SignatureSubscriptionCallback,
    options?: SignatureSubscriptionOptions
  ): number {
    throw new Error("not implemented");
  }

  removeSignatureListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }

  onRootChange(callback: RootChangeCallback): number {
    throw new Error("not implemented");
  }

  removeRootChangeListener(id: number): Promise<void> {
    throw new Error("not implemented");
  }
}

export async function confirmTransaction(
  c: Connection,
  txSig: string,
  commitment: Finality
): Promise<ParsedConfirmedTransaction> {
  return new Promise(async (resolve, reject) => {
    setTimeout(
      () =>
        reject(new Error(`30 second timeout: unable to confirm transaction`)),
      30000
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    let tx = await c.getParsedTransaction(txSig, commitment);
    while (tx === null) {
      tx = await c.getParsedTransaction(txSig, commitment);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    resolve(tx);
  });
}
