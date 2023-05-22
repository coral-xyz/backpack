import { RESTDataSource } from "@apollo/datasource-rest";

import type { NotificationApplicationData } from "../types";

/**
 * Custom GraphQL REST data source class for the Backpack SWR cache API.
 * @export
 * @class Swr
 * @extends {RESTDataSource}
 */
export class Swr extends RESTDataSource {
  override baseURL = "https://swr.xnfts.dev";

  constructor() {
    super();
  }

  /**
   * Get the cached metadata and account data for an xNFT program account.
   * @param {string} address
   * @returns {Promise<NotificationApplicationData>}
   * @memberof Swr
   */
  async getXnftData(address: string): Promise<NotificationApplicationData> {
    const resp = await this.get(`/nft-data/xnft/${address}`);
    return {
      id: `notification_app:${address}`,
      image: resp.metadata.image,
      name: resp.metadata.name,
    };
  }
}
