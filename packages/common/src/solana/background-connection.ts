import BN from "bn.js";
import { Buffer } from "buffer";
import { Connection, PublicKey } from "@solana/web3.js";
import type {
  ConnectionConfig,
  Commitment,
  GetSupplyConfig,
  RpcResponseAndContext,
  Supply,
  TokenAmount,
  TokenAccountsFilter,
  AccountInfo,
  ParsedAccountData,
  GetLargestAccountsConfig,
  AccountBalancePair,
  TokenAccountBalancePair,
  GetProgramAccountsConfig,
  StakeActivationData,
  ContactInfo,
  GetParsedProgramAccountsConfig,
  SignatureResult,
  VoteAccountStatus,
  TransactionSignature,
  Finality,
  ConfirmedTransaction,
  BlockSignatures,
  ConfirmedSignaturesForAddress2Options,
  TransactionResponse,
  NonceAccount,
  SignaturesForAddressOptions,
  ConfirmedSignatureInfo,
  ParsedConfirmedTransaction,
  Transaction,
  Message,
  Signer,
  SendOptions,
  SimulatedTransactionResponse,
  AccountChangeCallback,
  ProgramAccountChangeCallback,
  GetProgramAccountsFilter,
  LogsFilter,
  LogsCallback,
  SignatureResultCallback,
  SlotChangeCallback,
  SignatureSubscriptionCallback,
  RootChangeCallback,
  SignatureSubscriptionOptions,
  SlotUpdateCallback,
  ConfirmedBlock,
  BlockResponse,
  Version,
  GetBlockProductionConfig,
  BlockProduction,
  Blockhash,
  FeeCalculator,
  SignatureStatusConfig,
  EpochSchedule,
  LeaderSchedule,
  EpochInfo,
  InflationGovernor,
  InflationReward,
  SignatureStatus,
  PerfSample,
  BlockheightBasedTransactionConfirmationStrategy,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";
import {
  SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO,
  SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
  SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER,
  SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
  SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION,
  SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS,
  SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO,
  SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
  SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
} from "../constants";
import type { BackgroundClient } from "../channel";

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
    tokenAccountsMap: any;
    tokenMetadata: any;
    nftMetadata: any;
  }> {
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
      params: [publicKey.toString()],
    });
    return BackgroundSolanaConnection.customSplTokenAccountsFromJson(resp);
  }

  static customSplTokenAccountsFromJson(json: any) {
    json.tokenAccountsMap.map((t: any) => {
      t[1].amount = new BN(t[1].amount);
      return t;
    });
    return json;
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

  async getLatestBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    lastValidBlockHeight: number;
  }> {
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH,
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
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION,
      params: [rawTransaction, options],
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
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS,
      params: [programId.toString(), configOrCommitment],
    });
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Below this not yet implemented.
  ///////////////////////////////////////////////////////////////////////////////

  async sendTransaction(
    transaction: Transaction,
    signers: Array<Signer>,
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

  async getBalance(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<number> {
    throw new Error("not implemented");
  }

  async getBlockTime(slot: number): Promise<number | null> {
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

  async getTokenAccountBalance(
    tokenAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    throw new Error("not implemented");
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
    throw new Error("not implemented");
  }

  async getLargestAccounts(
    config?: GetLargestAccountsConfig
  ): Promise<RpcResponseAndContext<Array<AccountBalancePair>>> {
    throw new Error("not implemented");
  }

  async getTokenLargestAccounts(
    mintAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<Array<TokenAccountBalancePair>>> {
    throw new Error("not implemented");
  }

  async getAccountInfoAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<AccountInfo<Buffer> | null>> {
    throw new Error("not implemented");
  }

  async getParsedAccountInfo(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<
    RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>
  > {
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

  async getParsedProgramAccounts(
    programId: PublicKey,
    configOrCommitment?: GetParsedProgramAccountsConfig | Commitment
  ): Promise<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<Buffer | ParsedAccountData>;
    }>
  > {
    throw new Error("not implemented");
  }

  getClusterNodes(): Promise<Array<ContactInfo>> {
    throw new Error("not implemented");
  }

  getVoteAccounts(commitment?: Commitment): Promise<VoteAccountStatus> {
    throw new Error("not implemented");
  }

  getSlot(commitment?: Commitment): Promise<number> {
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

  getMinimumBalanceForRentExemption(
    dataLength: number,
    commitment?: Commitment
  ): Promise<number> {
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

  getFeeForMessage(
    message: Message,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<number>> {
    throw new Error("not implemented");
  }

  getRecentBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
  }> {
    throw new Error("not implemented");
  }

  getLatestBlockhashAndContext(commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      lastValidBlockHeight: number;
    }>
  > {
    throw new Error("not implemented");
  }

  getVersion(): Promise<Version> {
    throw new Error("not implemented");
  }

  getGenesisHash(): Promise<string> {
    throw new Error("not implemented");
  }
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

  simulateTransaction(
    transactionOrMessage: Transaction | Message,
    signers?: Array<Signer>,
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
  commitment: Finality
) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  let tx = await c.getParsedTransaction(txSig, commitment);
  while (tx === null) {
    tx = await c.getParsedTransaction(txSig, commitment);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
