import { Connection, PublicKey } from "@solana/web3.js";
import type {
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
  VersionedTransaction,
  Message,
  MessageV0,
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
  AddressLookupTableAccount,
  GetAccountInfoConfig,
  SimulateTransactionConfig,
  VersionedMessage,
} from "@solana/web3.js";
import type { Notification, EventEmitter } from "@coral-xyz/common";
import { encode } from "bs58";
import {
  getLogger,
  customSplTokenAccounts,
  Blockchain,
  confirmTransaction,
  BACKEND_EVENT,
  NOTIFICATION_BLOCKCHAIN_DISABLED,
  NOTIFICATION_BLOCKCHAIN_ENABLED,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE,
} from "@coral-xyz/common";
import type { CachedValue } from "../types";

const logger = getLogger("solana-connection-backend");

export const LOAD_SPL_TOKENS_REFRESH_INTERVAL = 10 * 1000;
export const RECENT_BLOCKHASH_REFRESH_INTERVAL = 10 * 1000;
// Time until cached values expire. This is arbitrary.
const CACHE_EXPIRY = 15000;

export function start(events: EventEmitter): SolanaConnectionBackend {
  const b = new SolanaConnectionBackend(events);
  b.start();
  return b;
}

export class SolanaConnectionBackend {
  private cache = new Map<string, CachedValue<any>>();
  private connection?: Connection;
  private url?: string;
  private pollIntervals: Array<any>;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.pollIntervals = [];
    this.events = events;
  }

  public start() {
    this.setupEventListeners();
  }

  //
  // The connection backend needs to change its behavior based on what happens
  // in the core backend. E.g., if the keyring store gets locked, then we
  // need to stop polling.
  //
  private setupEventListeners() {
    this.events.addListener(BACKEND_EVENT, (notif: Notification) => {
      logger.debug(`received notification: ${notif.name}`, notif);

      switch (notif.name) {
        case NOTIFICATION_KEYRING_STORE_CREATED:
          handleKeyringStoreCreated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked(notif);
          break;
        case NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
          handleConnectionUrlUpdated(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_ENABLED:
          handleBlockchainEnabled(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_DISABLED:
          handleBlockchainDisabled(notif);
          break;
        default:
          break;
      }
    });

    const handleKeyringStoreCreated = (notif: Notification) => {
      handleKeyringStoreUnlocked(notif);
    };

    const handleKeyringStoreUnlocked = (notif: Notification) => {
      const { blockchainActiveWallets, solanaConnectionUrl, solanaCommitment } =
        notif.data;

      this.connection = new Connection(solanaConnectionUrl, solanaCommitment);
      this.url = solanaConnectionUrl;

      this.hookRpcRequest();

      const activeWallet = blockchainActiveWallets[Blockchain.SOLANA];
      if (activeWallet) {
        this.startPolling(new PublicKey(activeWallet));
      }
    };

    const handleKeyringStoreLocked = (_notif: Notification) => {
      this.stopPolling();
    };

    const handleActiveWalletUpdated = (notif: Notification) => {
      const { activeWallet } = notif.data;
      this.stopPolling();
      this.startPolling(new PublicKey(activeWallet));
    };

    const handleConnectionUrlUpdated = (notif: Notification) => {
      const { activeWallet, url } = notif.data;
      this.connection = new Connection(url, this.connection!.commitment);
      this.url = url;
      // activeWallet can be null if the blockchain is disabled, in that case
      // we don't want to start polling
      if (activeWallet) {
        this.stopPolling();
        this.hookRpcRequest();
        this.startPolling(new PublicKey(activeWallet));
      }
    };

    const handleBlockchainEnabled = (notif: Notification) => {
      const { blockchain, activeWallet } = notif.data;
      if (blockchain === Blockchain.SOLANA) {
        // Start polling if Solana was enabled in wallet settings
        this.startPolling(new PublicKey(activeWallet));
      }
    };

    const handleBlockchainDisabled = (notif: Notification) => {
      const { blockchain } = notif.data;
      if (blockchain === Blockchain.SOLANA) {
        // Stop polling if Solana was disabled in wallet settings
        this.stopPolling();
      }
    };
  }

  //
  // Poll for data in the background script so that, even if the popup closes
  // the data is still fresh.
  //
  private async startPolling(activeWallet: PublicKey) {
    this.pollIntervals.push(
      setInterval(async () => {
        const _data = await customSplTokenAccounts(
          this.connection!,
          activeWallet
        );
        const data = {
          ..._data,
          tokenAccountsMap: _data.tokenAccountsMap.map((t: any) => {
            return [
              t[0],
              {
                ...t[1],
                mint: t[1].mint.toString(),
              },
            ];
          }),
        };
        const key = JSON.stringify({
          url: this.url,
          method: "customSplTokenAccounts",
          args: [activeWallet.toString()],
        });
        this.cache.set(key, {
          ts: Date.now(),
          value: data,
        });
        this.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE,
          data: {
            connectionUrl: this.url,
            publicKey: activeWallet.toString(),
            customSplTokenAccounts: {
              ...data,
            },
          },
        });
      }, LOAD_SPL_TOKENS_REFRESH_INTERVAL)
    );

    this.pollIntervals.push(
      setInterval(async () => {
        const conn = new Connection(this.url!); // Unhooked connection.
        const data = await conn.getLatestBlockhash();
        const key = JSON.stringify({
          url: this.url,
          method: "getLatestBlockhash",
          args: [],
        });
        this.cache.set(key, {
          ts: Date.now(),
          value: data,
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
      const key = JSON.stringify({
        url: this.url,
        method,
        args,
      });

      // Only use cached values at most 15 seconds old.
      const value = this.cache.get(key);
      if (value && value.ts + CACHE_EXPIRY > Date.now()) {
        return value.value;
      }
      const resp = await _rpcRequest(method, args);
      this.cache.set(key, {
        ts: Date.now(),
        value: resp,
      });
      return resp;
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // Custom endpoints.
  //////////////////////////////////////////////////////////////////////////////

  async customSplTokenAccounts(publicKey: PublicKey): Promise<any> {
    const key = JSON.stringify({
      url: this.url,
      method: "customSplTokenAccounts",
      args: [publicKey.toString()],
    });
    const value = this.cache.get(key);
    if (value && value.ts + CACHE_EXPIRY > Date.now()) {
      return value.value;
    }
    const resp = await customSplTokenAccounts(this.connection!, publicKey);
    this.cache.set(key, {
      ts: Date.now(),
      value: resp,
    });
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

  async getAccountInfoAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<AccountInfo<Buffer> | null>> {
    return await this.connection!.getAccountInfoAndContext(
      publicKey,
      commitment
    );
  }

  async getLatestBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    lastValidBlockHeight: number;
  }> {
    if (!this.connection) {
      throw new Error("inner connection not found");
    }
    const resp = await this.connection!.getLatestBlockhash(commitment);
    return resp;
  }

  async getLatestBlockhashAndContext(commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      lastValidBlockHeight: number;
    }>
  > {
    const resp = await this.connection!.getLatestBlockhashAndContext(
      commitment
    );
    return resp;
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
    strategy: BlockheightBasedTransactionConfirmationStrategy,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<SignatureResult>> {
    const tx = await confirmTransaction(
      this.connection!,
      strategy.signature,
      commitment === "confirmed" || commitment === "finalized"
        ? commitment
        : "confirmed"
    );
    return {
      context: {
        slot: tx.slot,
      },
      value: {
        err: null,
      },
    };
  }

  async simulateTransaction(
    transactionOrMessage: Transaction | VersionedTransaction | Message,
    configOrSigners?: Array<Signer> | SimulateTransactionConfig,
    includeAccounts?: boolean | Array<PublicKey>
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    if ("message" in transactionOrMessage) {
      // VersionedTransaction
      if (Array.isArray(configOrSigners)) {
        throw new Error("Invalid arguments to simulateTransaction");
      }
      return await this.connection!.simulateTransaction(
        transactionOrMessage,
        configOrSigners
      );
    } else {
      return await this.connection!.simulateTransaction(
        transactionOrMessage,
        configOrSigners as Array<Signer>,
        includeAccounts
      );
    }
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

  async getParsedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ParsedConfirmedTransaction | null> {
    const conn = new Connection(this.url!); // Unhooked connection.
    return await conn.getParsedTransaction(
      signature,
      commitment ?? "confirmed"
    );
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
    return await this.connection!.getProgramAccounts(
      programId,
      configOrCommitment
    );
  }

  async getFeeForMessage(
    message: VersionedMessage,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<number>> {
    const encodedMessage = Buffer.from(message.serialize()).toString("base64");
    return await this.connection!.getFeeForMessage(
      {
        serialize: () => ({
          toString: () => {
            return encodedMessage;
          },
        }),
      } as Message,
      commitment
    );
  }

  async getMinimumBalanceForRentExemption(
    dataLength: number,
    commitment?: Commitment
  ): Promise<number> {
    return await this.connection!.getMinimumBalanceForRentExemption(
      dataLength,
      commitment
    );
  }

  async getTokenAccountBalance(
    tokenAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    return await this.connection!.getTokenAccountBalance(
      tokenAddress,
      commitment
    );
  }

  async getBalance(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<number> {
    return await this.connection!.getBalance(publicKey, commitment);
  }

  async getSlot(commitment?: Commitment): Promise<number> {
    return await this.connection!.getSlot(commitment);
  }

  async getBlockTime(slot: number): Promise<number | null> {
    return await this.connection!.getBlockTime(slot);
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
    return await this.connection!.getParsedTokenAccountsByOwner(
      ownerAddress,
      filter,
      commitment
    );
  }

  async getTokenLargestAccounts(
    mintAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<Array<TokenAccountBalancePair>>> {
    return await this.connection!.getTokenLargestAccounts(
      mintAddress,
      commitment
    );
  }

  async getParsedAccountInfo(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<
    RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>
  > {
    return await this.connection!.getParsedAccountInfo(publicKey, commitment);
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
    return await this.connection!.getParsedProgramAccounts(
      programId,
      configOrCommitment
    );
  }

  async getAddressLookupTable(
    programId: PublicKey,
    config?: GetAccountInfoConfig
  ): Promise<RpcResponseAndContext<AddressLookupTableAccount | null>> {
    return await this.connection!.getAddressLookupTable(programId, config);
  }

  async getBalanceAndContext(
    publicKey: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<number>> {
    return await this.connection!.getBalanceAndContext(publicKey, commitment);
  }

  async getMinimumLedgerSlot(): Promise<number> {
    return await this.connection!.getMinimumLedgerSlot();
  }

  async getFirstAvailableBlock(): Promise<number> {
    return await this.connection!.getFirstAvailableBlock();
  }

  async getSupply(
    config?: GetSupplyConfig | Commitment
  ): Promise<RpcResponseAndContext<Supply>> {
    return await this.connection!.getSupply(config);
  }

  async getTokenSupply(
    tokenMintAddress: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    return await this.connection!.getTokenSupply(tokenMintAddress, commitment);
  }

  async getLargestAccounts(
    config?: GetLargestAccountsConfig
  ): Promise<RpcResponseAndContext<Array<AccountBalancePair>>> {
    return await this.connection!.getLargestAccounts(config);
  }

  async getMultipleAccountsInfoAndContext(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<(AccountInfo<Buffer> | null)[]>> {
    return await this.connection!.getMultipleAccountsInfoAndContext(
      publicKeys,
      commitment
    );
  }

  async getStakeActivation(
    publicKey: PublicKey,
    commitment?: Commitment,
    epoch?: number
  ): Promise<StakeActivationData> {
    return await this.connection!.getStakeActivation(
      publicKey,
      commitment,
      epoch
    );
  }

  async getClusterNodes(): Promise<Array<ContactInfo>> {
    return await this.connection!.getClusterNodes();
  }

  async getVoteAccounts(commitment?: Commitment): Promise<VoteAccountStatus> {
    return await this.connection!.getVoteAccounts(commitment);
  }

  async getSlotLeader(commitment?: Commitment): Promise<string> {
    return await this.connection!.getSlotLeader(commitment);
  }

  async getSlotLeaders(
    startSlot: number,
    limit: number
  ): Promise<Array<PublicKey>> {
    return await this.connection!.getSlotLeaders(startSlot, limit);
  }

  async getSignatureStatus(
    signature: TransactionSignature,
    config?: SignatureStatusConfig
  ): Promise<RpcResponseAndContext<SignatureStatus | null>> {
    return await this.connection!.getSignatureStatus(signature, config);
  }

  async getSignatureStatuses(
    signatures: Array<TransactionSignature>,
    config?: SignatureStatusConfig
  ): Promise<RpcResponseAndContext<Array<SignatureStatus | null>>> {
    return await this.connection!.getSignatureStatuses(signatures, config);
  }

  async getTransactionCount(commitment?: Commitment): Promise<number> {
    return await this.connection!.getTransactionCount(commitment);
  }

  async getTotalSupply(commitment?: Commitment): Promise<number> {
    return await this.connection!.getTotalSupply(commitment);
  }

  async getInflationGovernor(
    commitment?: Commitment
  ): Promise<InflationGovernor> {
    return await this.connection!.getInflationGovernor(commitment);
  }

  async getInflationReward(
    addresses: PublicKey[],
    epoch?: number,
    commitment?: Commitment
  ): Promise<(InflationReward | null)[]> {
    return await this.connection!.getInflationReward(
      addresses,
      epoch,
      commitment
    );
  }

  async getEpochInfo(commitment?: Commitment): Promise<EpochInfo> {
    return await this.connection!.getEpochInfo(commitment);
  }

  async getEpochSchedule(): Promise<EpochSchedule> {
    return await this.connection!.getEpochSchedule();
  }

  async getLeaderSchedule(): Promise<LeaderSchedule> {
    return await this.connection!.getLeaderSchedule();
  }

  async getRecentBlockhashAndContext(commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    }>
  > {
    return await this.connection!.getRecentBlockhashAndContext(commitment);
  }

  async getRecentPerformanceSamples(
    limit?: number
  ): Promise<Array<PerfSample>> {
    return await this.connection!.getRecentPerformanceSamples(limit);
  }

  async getFeeCalculatorForBlockhash(
    blockhash: Blockhash,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<FeeCalculator | null>> {
    return await this.connection!.getFeeCalculatorForBlockhash(
      blockhash,
      commitment
    );
  }

  async getRecentBlockhash(commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
  }> {
    return await this.connection!.getRecentBlockhash(commitment);
  }

  async getVersion(): Promise<Version> {
    return await this.connection!.getVersion();
  }

  async getGenesisHash(): Promise<string> {
    return await this.connection!.getGenesisHash();
  }

  async getBlock(
    slot: number,
    opts?: {
      commitment?: Finality;
    }
  ): Promise<BlockResponse | null> {
    return await this.connection!.getBlock(slot, opts);
  }

  async getBlockHeight(commitment?: Commitment): Promise<number> {
    return await this.connection!.getBlockHeight(commitment);
  }

  async getBlockProduction(
    configOrCommitment?: GetBlockProductionConfig | Commitment
  ): Promise<RpcResponseAndContext<BlockProduction>> {
    return await this.connection!.getBlockProduction(configOrCommitment);
  }

  async getTransaction(
    signature: string,
    opts?: {
      commitment?: Finality;
    }
  ): Promise<TransactionResponse | null> {
    return await this.connection!.getTransaction(signature, opts);
  }

  async getConfirmedBlock(
    slot: number,
    commitment?: Finality
  ): Promise<ConfirmedBlock> {
    return await this.connection!.getConfirmedBlock(slot, commitment);
  }

  async getBlocks(
    startSlot: number,
    endSlot?: number,
    commitment?: Finality
  ): Promise<Array<number>> {
    return await this.connection!.getBlocks(startSlot, endSlot, commitment);
  }

  async getBlockSignatures(
    slot: number,
    commitment?: Finality
  ): Promise<BlockSignatures> {
    return await this.connection!.getBlockSignatures(slot, commitment);
  }

  async getConfirmedBlockSignatures(
    slot: number,
    commitment?: Finality
  ): Promise<BlockSignatures> {
    return await this.connection!.getConfirmedBlockSignatures(slot, commitment);
  }

  async getConfirmedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ConfirmedTransaction | null> {
    return await this.connection!.getConfirmedTransaction(
      signature,
      commitment
    );
  }

  async getParsedConfirmedTransaction(
    signature: TransactionSignature,
    commitment?: Finality
  ): Promise<ParsedConfirmedTransaction | null> {
    return await this.connection!.getParsedConfirmedTransaction(
      signature,
      commitment
    );
  }

  async getParsedConfirmedTransactions(
    signatures: TransactionSignature[],
    commitment?: Finality
  ): Promise<(ParsedConfirmedTransaction | null)[]> {
    return await this.connection!.getParsedConfirmedTransactions(
      signatures,
      commitment
    );
  }

  async getConfirmedSignaturesForAddress(
    address: PublicKey,
    startSlot: number,
    endSlot: number
  ): Promise<Array<TransactionSignature>> {
    return await this.connection!.getConfirmedSignaturesForAddress(
      address,
      startSlot,
      endSlot
    );
  }

  async getSignaturesForAddress(
    address: PublicKey,
    options?: SignaturesForAddressOptions,
    commitment?: Finality
  ): Promise<Array<ConfirmedSignatureInfo>> {
    return await this.connection!.getSignaturesForAddress(
      address,
      options,
      commitment
    );
  }

  async getNonceAndContext(
    nonceAccount: PublicKey,
    commitment?: Commitment
  ): Promise<RpcResponseAndContext<NonceAccount | null>> {
    return await this.connection!.getNonceAndContext(nonceAccount, commitment);
  }

  async getNonce(
    nonceAccount: PublicKey,
    commitment?: Commitment
  ): Promise<NonceAccount | null> {
    return await this.connection!.getNonce(nonceAccount, commitment);
  }

  async requestAirdrop(
    to: PublicKey,
    lamports: number
  ): Promise<TransactionSignature> {
    return await this.connection!.requestAirdrop(to, lamports);
  }

  async sendTransaction(
    transaction: Transaction,
    signers: Array<Signer>,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    return await this.connection!.sendTransaction(
      transaction,
      signers,
      options
    );
  }

  async sendEncodedTransaction(
    encodedTransaction: string,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    return await this.connection!.sendEncodedTransaction(
      encodedTransaction,
      options
    );
  }

  onAccountChange(
    publicKey: PublicKey,
    callback: AccountChangeCallback,
    commitment?: Commitment
  ): number {
    return this.connection!.onAccountChange(publicKey, callback, commitment);
  }

  async removeAccountChangeListener(id: number): Promise<void> {
    return await this.connection!.removeAccountChangeListener(id);
  }

  onProgramAccountChange(
    programId: PublicKey,
    callback: ProgramAccountChangeCallback,
    commitment?: Commitment,
    filters?: GetProgramAccountsFilter[]
  ): number {
    return this.connection!.onProgramAccountChange(
      programId,
      callback,
      commitment,
      filters
    );
  }

  async removeProgramAccountChangeListener(id: number): Promise<void> {
    return await this.connection!.removeProgramAccountChangeListener(id);
  }

  onLogs(
    filter: LogsFilter,
    callback: LogsCallback,
    commitment?: Commitment
  ): number {
    return this.connection!.onLogs(filter, callback, commitment);
  }

  async removeOnLogsListener(id: number): Promise<void> {
    return await this.connection!.removeOnLogsListener(id);
  }

  onSlotChange(callback: SlotChangeCallback): number {
    return this.connection!.onSlotChange(callback);
  }

  async removeSlotChangeListener(id: number): Promise<void> {
    return await this.connection!.removeSlotChangeListener(id);
  }

  onSlotUpdate(callback: SlotUpdateCallback): number {
    return this.connection!.onSlotUpdate(callback);
  }

  async removeSlotUpdateListener(id: number): Promise<void> {
    return this.connection!.removeSlotUpdateListener(id);
  }

  _buildArgs(
    args: Array<any>,
    override?: Commitment,
    encoding?: "jsonParsed" | "base64",
    extra?: any
  ): Array<any> {
    return this.connection!._buildArgs(args, override, encoding, extra);
  }

  onSignature(
    signature: TransactionSignature,
    callback: SignatureResultCallback,
    commitment?: Commitment
  ): number {
    return this.connection!.onSignature(signature, callback, commitment);
  }

  onSignatureWithOptions(
    signature: TransactionSignature,
    callback: SignatureSubscriptionCallback,
    options?: SignatureSubscriptionOptions
  ): number {
    return this.connection!.onSignatureWithOptions(
      signature,
      callback,
      options
    );
  }

  async removeSignatureListener(id: number): Promise<void> {
    return await this.connection!.removeSignatureListener(id);
  }

  onRootChange(callback: RootChangeCallback): number {
    return this.connection!.onRootChange(callback);
  }

  async removeRootChangeListener(id: number): Promise<void> {
    return this.connection!.removeRootChangeListener(id);
  }
}
