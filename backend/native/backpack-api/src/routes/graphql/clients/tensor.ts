import { RESTDataSource } from "@apollo/datasource-rest";

type TensorOptions = {
  apiKey: string;
};

/**
 * Custom GraphQL REST data source class for the Tensor API.
 * @export
 * @class Tensor
 * @extends {RESTDataSource}
 */
export class Tensor extends RESTDataSource {
  readonly #apiKey: string;

  override baseURL = "https://api.tensor.so";

  constructor(opts: TensorOptions) {
    super();
    this.#apiKey = opts.apiKey;
  }

  /**
   * Fetch a list of active listings on Tensor by the argued wallet address.
   * @param {string} address
   * @returns {Promise<TensorActingListingsResponse>}
   * @memberof Tensor
   */
  async getActiveListingsForWallet(
    address: string
  ): Promise<TensorActingListingsResponse> {
    return this.post("/graphql", {
      headers: {
        "Content-Type": "application/json",
        "X-TENSOR-API-KEY": this.#apiKey,
      },
      body: JSON.stringify({
        query: `
          query GetListingsForWallet($wallet: String!, $sortBy: ActiveListingsSortBy!) {
            userActiveListings(wallets: [$wallet], sortBy: $sortBy) {
              txs {
                tx {
                  grossAmount
                  mintOnchainId
                  source
                }
              }
            }
          }
        `,
        variables: {
          sortBy: "ListedDesc",
          wallet: address,
        },
      }),
    });
  }

  /**
   * Get the website URL of the listing mint item.
   * @param {string} mint
   * @returns {string}
   * @memberof Tensor
   */
  getListingUrl(mint: string): string {
    return `https://tensor.trade/item/${mint}`;
  }
}

////////////////////////////////////////////
//                Types                   //
////////////////////////////////////////////

export type TensorActingListingsResponse = {
  data: {
    userActiveListings: {
      txs: Array<{
        tx: {
          grossAmount: string;
          mintOnchainId: string;
          source: string;
        };
      }>;
    };
  };
};
