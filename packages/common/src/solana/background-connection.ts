// needed to avoid TS error TS2742, see: https://bit.ly/3ymWOFj
import type {} from "@metaplex-foundation/beet";
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
  GetVersionedTransactionConfig,
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
import { decode as bs58Decode, encode as bs58Encode } from "bs58";
import { Buffer } from "buffer";

import type { BackgroundClient } from "../channel";
import {
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
} from "../constants";
import { IS_MOBILE } from "../utils";

import type {
  CustomSplTokenAccountsResponse,
  CustomSplTokenAccountsResponseString,
} from "./programs/token";
import { addressLookupTableAccountParser } from "./rpc-helpers";
import type {
  SolanaTokenAccountWithKeyAndProgramId,
  SolanaTokenAccountWithKeyAndProgramIdString,
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

  async customSplMetadataUri(
    tokens: Array<SolanaTokenAccountWithKeyAndProgramIdString>,
    tokenMetadata: Array<TokenMetadataString | null>
  ): Promise<Array<[string, SplNftMetadataString]>> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI,
      params: [tokens, tokenMetadata],
    });
  }

  async customSplTokenAccounts(
    publicKey: PublicKey
  ): Promise<CustomSplTokenAccountsResponseString> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
      params: [publicKey.toString()],
    });
    return BackgroundSolanaConnection.customSplTokenAccountsFromJson(resp);
  }

  static customSplTokenAccountsFromJson(
    json: CustomSplTokenAccountsResponseString
  ): CustomSplTokenAccountsResponseString {
    return {
      mintsMap: json.mintsMap.map((m: any) => {
        return [
          m[0],
          {
            ...m[1],
            supply: BigInt(m[1].supply),
          },
        ];
      }),
      fts: {
        ...json.fts,
        fungibleTokens: json.fts.fungibleTokens.map((t: any) => {
          return {
            ...t,
            amount: new BN(t.amount),
          };
        }),
      },
      nfts: {
        ...json.nfts,
        nftTokens: json.nfts.nftTokens.map((t: any) => {
          return {
            ...t,
            amount: new BN(t.amount),
          };
        }),
      },
    };
  }

  static customSplTokenAccountsToJson(
    _resp: CustomSplTokenAccountsResponse
  ) /* : CustomSplTokenAccountsResponseString */ {
    return {
      mintsMap: _resp.mintsMap.map(([publicKey, mintStr]) => {
        return [
          publicKey,
          mintStr != null
            ? {
                ...mintStr,
                supply: mintStr.supply.toString(),
                mintAuthority: mintStr.mintAuthority?.toString(),
                freezeAuthority: mintStr.freezeAuthority?.toString(),
              }
            : null,
        ];
      }),
      fts: {
        fungibleTokens: _resp.fts.fungibleTokens.map((t) => {
          return BackgroundSolanaConnection.solanaTokenAccountWithKeyToJson(t);
        }),
        fungibleTokenMetadata: _resp.fts.fungibleTokenMetadata.map((t) => {
          return t ? BackgroundSolanaConnection.tokenMetadataToJson(t) : null;
        }),
      },
      nfts: {
        nftTokens: _resp.nfts.nftTokens.map((t) => {
          return BackgroundSolanaConnection.solanaTokenAccountWithKeyToJson(t);
        }),
        nftTokenMetadata: _resp.nfts.nftTokenMetadata.map((t) => {
          return t ? BackgroundSolanaConnection.tokenMetadataToJson(t) : null;
        }),
      },
    };
  }

  static solanaTokenAccountWithKeyToJson(
    t: SolanaTokenAccountWithKeyAndProgramId
  ) /* : SolanaTokenAccountWithKeyAndProgramIdString */ {
    return {
      ...t,
      mint: t.mint.toString(),
      key: t.key.toString(),
      programId: t.programId.toString(),
      amount: t.amount.toString(),
      delegate: t.delegate?.toString(),
      delegatedAmount: t.delegatedAmount.toString(),
      authority: t.authority.toString(),
      closeAuthority: t.closeAuthority?.toString(),
    };
  }

  static tokenMetadataToJson(t: TokenMetadata) /* : TokenMetadataString */ {
    return {
      ...t,
      publicKey: t.publicKey.toString(),
      account: {
        ...t.account,
        updateAuthority: t.account.updateAuthority.toString(),
        mint: t.account.mint.toString(),
        collection: t.account.collection
          ? {
              ...t.account.collection,
              key: t.account.collection.key.toString(),
            }
          : null,
        uses: t.account.uses
          ? {
              ...t.account.uses,
              remaining: t.account.uses.remaining.toString(),
              total: t.account.uses.total.toString(),
            }
          : null,
        data: {
          ...t.account.data,
          creators: (t.account.data.creators ?? []).map((c) => {
            return {
              ...c,
              address: c.address.toString(),
            };
          }),
        },
      },
    };
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

    return BackgroundSolanaConnection.accountInfoFromJson(resp);
  }

  static accountInfoToJson(res: AccountInfo<Buffer> | null) {
    if (!IS_MOBILE) {
      return res;
    }

    if (res == null) {
      return res;
    }

    return {
      ...res,
      owner: res.owner.toString(),
      data: res.data ? bs58Encode(res.data) : res.data,
    };
  }

  static accountInfoFromJson(res: AccountInfo<any>) {
    if (!IS_MOBILE) {
      res.data = Buffer.from(res.data);
      res.owner = new PublicKey(res.owner);
      return res;
    }

    return {
      ...res,
      owner: new PublicKey(res.owner),
      data: bs58Decode(res.data),
    };
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

  async getAccountInfoAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<AccountInfo<Buffer> | null>> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT,
      params: [publicKey.toString(), commitment],
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
    const txStr = bs58Encode(rawTransaction);
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
      params: [txStr, options],
    });
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
    commitmentOrConfig?: GetVersionedTransactionConfig | Finality
  ): Promise<(ParsedConfirmedTransaction | null)[]> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
      params: [signatures, commitmentOrConfig],
    });
  }

  // @ts-ignore
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
    commitmentOrConfig?: GetVersionedTransactionConfig | Finality
  ): Promise<ParsedConfirmedTransaction | null> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
      params: [signature, commitmentOrConfig],
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
    let serializedMessage = bs58Encode(message.serialize());
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

  ///////////////////////////////////////////////////////////////////////////////
  // Below this not yet implemented.
  ///////////////////////////////////////////////////////////////////////////////

  async sendTransaction(
    transaction: VersionedTransaction | Transaction,
    signersOrOptions?: Array<Signer> | SendOptions,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    throw new Error("not implemented");
  }

  async getBalanceAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<number>> {
    throw new Error("not implemented");
  }

  async getMinimumLedgerSlot(): Promise<number> {
    throw new Error("not implemented");
  }

  async getFirstAvailableBlock(): Promise<number> {
    throw new Error("not implemented");
  }

  async getSupply(
    config?: GetSupplyConfig | Commitment
  ): Promise<RpcResponseAndContext<Supply>> {
    throw new Error("not implemented");
  }

  async getTokenSupply(
    tokenMintAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    throw new Error("not implemented");
  }

  async getLargestAccounts(
    config?: GetLargestAccountsConfig
  ): Promise<RpcResponseAndContext<Array<AccountBalancePair>>> {
    throw new Error("not implemented");
  }

  async getMultipleAccountsInfoAndContext(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<(AccountInfo<Buffer> | null)[]>> {
    throw new Error("not implemented");
  }

  async getStakeActivation(
    publicKey: PublicKey,
    commitment?: Commitment,
    epoch?: number
  ): Promise<StakeActivationData> {
    throw new Error("not implemented");
  }

  getClusterNodes(): Promise<Array<ContactInfo>> {
    throw new Error("not implemented");
  }

  getVoteAccounts(commitment?: Commitment): Promise<VoteAccountStatus> {
    throw new Error("not implemented");
  }

  getSlotLeader(commitment?: Commitment): Promise<string> {
    throw new Error("not implemented");
  }

  getSlotLeaders(startSlot: number, limit: number): Promise<Array<PublicKey>> {
    throw new Error("not implemented");
  }

  getSignatureStatus(
    signature: TransactionSignature,
    config?: SignatureStatusConfig
  ): Promise<RpcResponseAndContext<SignatureStatus | null>> {
    throw new Error("not implemented");
  }

  getSignatureStatuses(
    signatures: Array<TransactionSignature>,
    config?: SignatureStatusConfig
  ): Promise<RpcResponseAndContext<Array<SignatureStatus | null>>> {
    throw new Error("not implemented");
  }

  getTransactionCount(commitment?: Commitment): Promise<number> {
    throw new Error("not implemented");
  }

  getTotalSupply(commitment?: Commitment): Promise<number> {
    throw new Error("not implemented");
  }

  getInflationGovernor(commitment?: Commitment): Promise<InflationGovernor> {
    throw new Error("not implemented");
  }

  getInflationReward(
    addresses: PublicKey[],
    epoch?: number,
    commitment?: Commitment
  ): Promise<(InflationReward | null)[]> {
    throw new Error("not implemented");
  }

  getEpochInfo(commitment?: Commitment): Promise<EpochInfo> {
    throw new Error("not implemented");
  }

  getEpochSchedule(): Promise<EpochSchedule> {
    throw new Error("not implemented");
  }

  getLeaderSchedule(): Promise<LeaderSchedule> {
    throw new Error("not implemented");
  }

  getRecentBlockhashAndContext(commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    }>
  > {
    throw new Error("not implemented");
  }

  getRecentPerformanceSamples(limit?: number): Promise<Array<PerfSample>> {
    throw new Error("not implemented");
  }

  getFeeCalculatorForBlockhash(
    blockhash: Blockhash,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<FeeCalculator | null>> {
    throw new Error("not implemented");
  }

  getRecentBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
  }> {
    throw new Error("not implemented");
  }

  getVersion(): Promise<Version> {
    throw new Error("not implemented");
  }

  getGenesisHash(): Promise<string> {
    throw new Error("not implemented");
  }

  // @ts-ignore
  getBlock(
    slot: number,
    opts?: {
      commitment?: Finality;
    }
  ): Promise<BlockResponse | null> {
    throw new Error("not implemented");
  }

  getBlockHeight(commitment?: Commitment): Promise<number> {
    throw new Error("not implemented");
  }

  getBlockProduction(
    configOrCommitment?: GetBlockProductionConfig | Commitment
  ): Promise<RpcResponseAndContext<BlockProduction>> {
    throw new Error("not implemented");
  }

  getTransaction(
    signature: string,
    opts?: {
      commitment?: Finality;
    }
  ): Promise<TransactionResponse | null> {
    throw new Error("not implemented");
  }

  getConfirmedBlock(
    slot: number,
    commitment?: Finality
  ): Promise<ConfirmedBlock> {
    throw new Error("not implemented");
  }

  getBlocks(
    startSlot: number,
    endSlot?: number,
    commitment?: Finality
  ): Promise<Array<number>> {
    throw new Error("not implemented");
  }

  getBlockSignatures(
    slot: number,
    commitment?: Finality
  ): Promise<BlockSignatures> {
    throw new Error("not implemented");
  }

  getConfirmedBlockSignatures(
    slot: number,
    commitment?: Finality
  ): Promise<BlockSignatures> {
    throw new Error("not implemented");
  }

  getConfirmedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ConfirmedTransaction | null> {
    throw new Error("not implemented");
  }

  getParsedConfirmedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ParsedConfirmedTransaction | null> {
    throw new Error("not implemented");
  }

  getParsedConfirmedTransactions(
    signatures: TransactionSignature[],
    commitment?: Finality
  ): Promise<(ParsedConfirmedTransaction | null)[]> {
    throw new Error("not implemented");
  }

  getConfirmedSignaturesForAddress(
    address: PublicKey,
    startSlot: number,
    endSlot: number
  ): Promise<Array<TransactionSignature>> {
    throw new Error("not implemented");
  }

  getSignaturesForAddress(
    address: PublicKey,
    options?: SignaturesForAddressOptions,
    commitment?: Finality
  ): Promise<Array<ConfirmedSignatureInfo>> {
    throw new Error("not implemented");
  }

  getNonceAndContext(
    nonceAccount: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<NonceAccount | null>> {
    throw new Error("not implemented");
  }

  getNonce(
    nonceAccount: PublicKey,
    commitment?: Commitment
  ): Promise<NonceAccount | null> {
    throw new Error("not implemented");
  }

  requestAirdrop(
    to: PublicKey,
    lamports: number
  ): Promise<TransactionSignature> {
    throw new Error("not implemented");
  }

  async simulateTransaction(
    transactionOrMessage: VersionedTransaction | Transaction | Message,
    configOrSigners?: SimulateTransactionConfig | Array<Signer>,
    includeAccounts?: boolean | Array<PublicKey>
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    throw new Error("not implemented");
  }

  sendEncodedTransaction(
    encodedTransaction: string,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    throw new Error("not implemented");
  }

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
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
): Promise<ReturnType<(typeof c)["getParsedTransaction"]>> {
  return new Promise(async (resolve, reject) => {
    setTimeout(
      () =>
        reject(new Error(`30 second timeout: unable to confirm transaction`)),
      30000
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    let tx = await c.getParsedTransaction(txSig, commitmentOrConfig);
    while (tx === null) {
      tx = await c.getParsedTransaction(txSig, commitmentOrConfig);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    resolve(tx);
  });
}
