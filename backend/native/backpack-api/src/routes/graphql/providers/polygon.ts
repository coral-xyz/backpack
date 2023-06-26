import { PolygonTokenList } from "@coral-xyz/common";
import { Network } from "alchemy-sdk";

import { ALCHEMY_API_KEY } from "../../../config";
import type { ApiContext } from "../context";
import { ProviderId } from "../types";

import type { BlockchainDataProvider } from ".";
import { Ethereum } from "./ethereum";

export type PolygonProviderSettings = {
  context?: ApiContext;
};

/**
 * Polygon PoS L2 implementation of the common data provider API.
 * @export
 * @class Polygon
 * @extends {Ethereum}
 * @implements {BlockchainDataProvider}
 */
export class Polygon extends Ethereum implements BlockchainDataProvider {
  constructor({ context }: PolygonProviderSettings) {
    super({
      context,
      customSdkConfig: {
        apiKey: ALCHEMY_API_KEY,
        network: context?.network.devnet
          ? Network.MATIC_MUMBAI
          : Network.MATIC_MAINNET,
      },
      tokenList: PolygonTokenList,
    });
  }

  /**
   * Chain ID enum variant.
   * @override
   * @returns {ProviderId}
   * @memberof Polygon
   */
  override id(): ProviderId {
    return ProviderId.Polygon;
  }

  /**
   * Native coin decimals.
   * @override
   * @returns {number}
   * @memberof Polygon
   */
  override decimals(): number {
    return 18;
  }

  /**
   * Default native address.
   * @override
   * @returns {string}
   * @memberof Polygon
   */
  override defaultAddress(): string {
    return this.tokenList.native.address;
  }

  /**
   * Logo of the native coin.
   * @override
   * @returns {string}
   * @memberof Polygon
   */
  override logo(): string {
    return this.tokenList.native.logo!;
  }

  /**
   * The display name of the data provider.
   * @override
   * @returns {string}
   * @memberof Polygon
   */
  override name(): string {
    return "Polygon";
  }
}
