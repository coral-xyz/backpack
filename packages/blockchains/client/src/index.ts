import type { Network } from "@coral-xyz/blockchain-types";

/**
 * A connection to a blockchain. This class has both internal Provider and
 * Network types. The Provider is an instance of a blockchain specific provider
 * e.g. for EVM it may be `ethers.providers.JsonRpcProvider`.
 *
 * The Network is a Backpack internal representation of a specific blockchain,
 * e.g. Ethereum mainnet.
 */
export default abstract class BlockchainClient<T, N extends Network = Network> {
  protected network: N;
  protected provider: T | undefined;

  constructor(network: N, provider?: T) {
    this.network = network;
    this.provider = provider;
  }

  /**
   * Set the network
   */
  public setNetwork(network: N): void {
    this.network = network;
  }

  /**
   * Get the network
   */
  public getNetwork(): N {
    return this.network;
  }

  /**
   * Get the blockchain provider
   */
  public getProvider(): T | undefined {
    return this.provider;
  }

  /**
   * Set the blockchain provider
   */
  public setProvider(provider: T) {
    this.provider = provider;
  }

  public abstract getBlockByHash(
    blockHash: string,
    includeTx?: boolean
  ): Promise<any>;

  public abstract getBlockByNumber(
    blockNumber?: number,
    includeTx?: boolean
  ): Promise<any>;

  /**
   * Get the block height of the blockchain.
   */
  public abstract getBlockHeight(): Promise<number>;

  public abstract getTransactionByHash(transactionHash: string): Promise<any>;

  /**
   * Broadcast a signed transaction to the blockchain.
   */
  public abstract sendRawTransaction(rawTransaction: string): Promise<string>;

  /**
   * Simulate a transaction if the blockchain supports it.
   */
  public abstract simulateTransaction(rawTransaction: string): Promise<string>;
}
