import { RESTDataSource } from "@apollo/datasource-rest";

type BlockchainInfoOptions = {};

/**
 * Custom GraphQL REST data source class abstraction for Blockchain Info API.
 * @export
 * @class BlockchainInfo
 * @extends {RESTDataSource}
 */
export class BlockchainInfo extends RESTDataSource {
  override baseURL = "https://blockchain.info";

  constructor(_opts: BlockchainInfoOptions) {
    super();
  }

  /**
   * Get the Bitcoin balance data for the argued wallet address.
   * @param {string} address
   * @returns {Promise<BlockchainInfoBalanceResponse>}
   * @memberof BlockchainInfo
   */
  async getBalance(address: string): Promise<BlockchainInfoBalanceResponse> {
    const resp: Record<string, BlockchainInfoBalanceResponse> = await this.get(
      `/balance?active=${address}`
    );

    if (!resp[address]) {
      throw new Error(`no balance data found for ${address}`);
    }

    return resp[address];
  }

  /**
   * Return the recent transactions for a Bitcoin wallet address.
   * @param {string} address
   * @param {number} [transactionOffset]
   * @returns {Promise<BlockchainInfoTransactionsResponse>}
   * @memberof BlockchainInfo
   */
  async getRawAddressData(
    address: string,
    transactionOffset?: number
  ): Promise<BlockchainInfoTransactionsResponse> {
    return this.get(`/rawaddr/${address}`, {
      params: transactionOffset
        ? {
            offset: transactionOffset.toString(),
          }
        : undefined,
    });
  }
}

////////////////////////////////////////////
//                Types                   //
////////////////////////////////////////////

type BlockchainInfoBalanceResponse = {
  final_balance: number;
  n_tx: number;
  total_received: number;
};

type BlockchainInfoTransactionsResponse = {
  hash160: string;
  address: string;
  n_tx: number;
  n_unredeemed: number;
  total_received: number;
  total_sent: number;
  final_balance: number;
  txs: Array<{
    hash: string;
    ver: number;
    vin_sz: number;
    vout_sz: number;
    size: number;
    weight: number;
    fee: number;
    relayed_by: string;
    lock_time: number;
    tx_index: number;
    double_spend: boolean;
    time: number;
    block_index: number;
    block_height: number;
    result: number;
    balance: number;
    inputs: Array<{
      sequence: number;
      witness: string;
      script: string;
      index: number;
      prev_out: {
        addr: string;
        n: number;
        script: string;
        spending_outpoints: Array<{
          n: number;
          tx_index: number;
        }>;
        spent: boolean;
        tx_index: number;
        type: number;
        value: number;
      };
    }>;
    out: Array<{
      type: number;
      spent: boolean;
      value: number;
      spending_outpoints: any[];
      n: number;
      tx_index: number;
      script: string;
      addr: string;
    }>;
  }>;
};
