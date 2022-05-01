import { Spl, AnchorProvider } from "@project-serum/anchor";
import {
  Connection,
  ConnectionConfig,
  PublicKey,
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
  SignatureStatusNotification,
  EpochSchedule,
  LeaderSchedule,
  EpochInfo,
  InflationGovernor,
  InflationReward,
  SignatureStatus,
  PerfSample,
} from "@solana/web3.js";
import {
  customSplTokenAccounts,
  Notification,
  BACKEND_EVENT,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_SPL_TOKENS_DID_UPDATE,
  NOTIFICATION_BLOCKHASH_DID_UPDATE,
} from "@200ms/common";
import { Io } from "../io";

export const LOAD_SPL_TOKENS_REFRESH_INTERVAL = 10 * 1000;
export const RECENT_BLOCKHASH_REFRESH_INTERVAL = 10 * 1000;

export class Backend {
  private cache = new Map<string, any>();
  private connection?: Connection;
  private url?: string;
  private pollIntervals: Array<any>;

  constructor() {
    this.pollIntervals = [];
    this.setupEventListeners();
  }

  //
  // The connection backend needs to change its behavior based on what happens
  // in the core backend. E.g., if the keyring store gets locked, then we
  // need to stop polling.
  //
  private setupEventListeners() {
    Io.events.addListener(BACKEND_EVENT, (notif: Notification) => {
      switch (notif.name) {
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked(notif);
          break;
        case NOTIFICATION_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_CONNECTION_URL_UPDATED:
          handleConnectionUrlUpdated(notif);
          break;
        default:
      }
    });

    const handleKeyringStoreUnlocked = (notif: Notification) => {
      const { url, activeWallet, commitment } = notif.data;
      this.connection = new Connection(url, commitment);
      this.url = url;
      this.hookRpcRequest();
      this.startPolling(new PublicKey(activeWallet));
    };
    const handleKeyringStoreLocked = (notif: Notification) => {
      this.stopPolling();
    };
    const handleActiveWalletUpdated = (notif: Notification) => {
      const { activeWallet } = notif.data;
      this.stopPolling();
      this.startPolling(new PublicKey(activeWallet));
    };
    const handleConnectionUrlUpdated = (notif: Notification) => {
      const { url } = notif.data;
      this.cache = new Map();
      this.connection = new Connection(url, this.connection!.commitment);
      this.url = url;
      this.hookRpcRequest();
    };
  }

  //
  // Poll for data in the background script so that, even if the popup closes
  // the data is still fresh.
  //
  private async startPolling(activeWallet: PublicKey) {
    this.pollIntervals.push(
      setInterval(async () => {
        const data = await customSplTokenAccounts(
          this.connection!,
          activeWallet
        );
        const key = JSON.stringify({
          method: "customSplTokenAccounts",
          args: [activeWallet.toString()],
        });
        this.cache.set(key, data);
        Io.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_SPL_TOKENS_DID_UPDATE,
          data,
        });
      }, LOAD_SPL_TOKENS_REFRESH_INTERVAL)
    );

    this.pollIntervals.push(
      setInterval(async () => {
        const conn = new Connection(this.url!); // Unhooked connection.
        const data = await conn.getLatestBlockhash();
        const key = JSON.stringify({ method: "getLatestBlockhash", args: [] });
        this.cache.set(key, data);
        Io.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_BLOCKHASH_DID_UPDATE,
          data,
        });
      }, RECENT_BLOCKHASH_REFRESH_INTERVAL)
    );
  }

  private stopPolling() {
    this.pollIntervals.forEach((interval: number) => {
      clearInterval(interval);
    });
  }

  private hookRpcRequest() {
    // @ts-ignore
    const _rpcRequest = this.connection._rpcRequest;
    // @ts-ignore
    this.connection._rpcRequest = async (method: string, args: any[]) => {
      const key = JSON.stringify({ method, args });
      const value = this.cache.get(key);
      if (value) {
        return value;
      }
      const resp = await _rpcRequest(method, args);
      this.cache.set(key, resp);
      return resp;
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // Custom endpoints.
  //////////////////////////////////////////////////////////////////////////////

  async customSplTokenAccounts(publicKey: PublicKey): Promise<any> {
    const key = JSON.stringify({
      method: "customSplTokenAccounts",
      args: [publicKey.toString()],
    });
    const value = this.cache.get(key);
    if (value) {
      return value;
    }
    const resp = await customSplTokenAccounts(this.connection!, publicKey);
    this.cache.set(key, resp);
    return resp;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Solana Connection API.
  //////////////////////////////////////////////////////////////////////////////

  async getAccountInfo(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<AccountInfo<Buffer> | null> {
    return await this.connection!.getAccountInfo(publicKey, commitment);
  }

  async getLatestBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    lastValidBlockHeight: number;
  }> {
    return await this.connection!.getLatestBlockhash(commitment);
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
    return await this.connection!.getTokenAccountsByOwner(
      ownerAddress,
      filter,
      commitment
    );
  }

  async sendRawTransaction(
    rawTransaction: Buffer | Uint8Array | Array<number>,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    return await this.connection!.sendRawTransaction(rawTransaction, options);
  }

  async confirmTransaction(
    signature: TransactionSignature,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<SignatureResult>> {
    return await this.connection!.confirmTransaction(signature, commitment);
  }

  async simulateTransaction(
    transactionOrMessage: Transaction | Message,
    signers?: Array<Signer>,
    includeAccounts?: boolean | Array<PublicKey>
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    return await this.connection!.simulateTransaction(
      transactionOrMessage,
      signers,
      includeAccounts
    );
  }

  async getMultipleAccountsInfo(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<(AccountInfo<Buffer> | null)[]> {
    return await this.connection!.getMultipleAccountsInfo(
      publicKeys,
      commitment
    );
  }

  async getConfirmedSignaturesForAddress2(
    address: PublicKey,
    options?: ConfirmedSignaturesForAddress2Options,
    commitment?: Finality
  ): Promise<Array<ConfirmedSignatureInfo>> {
    return await this.connection!.getConfirmedSignaturesForAddress2(
      address,
      options,
      commitment ?? "confirmed"
    );
  }

  async getParsedTransactions(
    signatures: TransactionSignature[],
    commitment?: Finality
  ): Promise<(ParsedConfirmedTransaction | null)[]> {
    return await this.connection!.getParsedTransactions(
      signatures,
      commitment ?? "confirmed"
    );
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Methods below not used currently.
  ///////////////////////////////////////////////////////////////////////////////

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

  async getProgramAccounts(
    programId: PublicKey,
    configOrCommitment?: GetProgramAccountsConfig | Commitment
  ): Promise<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<Buffer>;
    }>
  > {
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

  getParsedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ParsedConfirmedTransaction | null> {
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

  sendTransaction(
    transaction: Transaction,
    signers: Array<Signer>,
    options?: SendOptions
  ): Promise<TransactionSignature> {
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

export const BACKEND = new Backend();
