import { EclipseTokenList } from "@coral-xyz/common";
import { SystemProgram } from "@solana/web3.js";

import type { ApiContext } from "../context";
import type { NftConnection, NftFiltersInput } from "../types";
import { ProviderId } from "../types";

import { SolanaRpc } from "./solana/rpc";
import type { BlockchainDataProvider } from ".";

export type EclipseProviderSettings = {
  context?: ApiContext;
};

/**
 * Eclipse SVM L2 implementation for the common data provider API.
 * @export
 * @class Eclipse
 * @extends {SolanaRpc}
 * @implements {BlockchainDataProvider}
 */
export class Eclipse extends SolanaRpc implements BlockchainDataProvider {
  constructor({ context }: EclipseProviderSettings) {
    super({
      context,
      customRpc: "https://api.injective.eclipsenetwork.xyz:8899",
      tokenList: EclipseTokenList,
    });
  }

  /**
   * Chain ID enum variant.
   * @override
   * @returns {ProviderId}
   * @memberof Eclipse
   */
  override id(): ProviderId {
    return ProviderId.Eclipse;
  }

  /**
   * Native coin decimals.
   * @override
   * @returns {number}
   * @memberof Eclipse
   */
  override decimals(): number {
    return 9;
  }

  /**
   * Default native address.
   * @override
   * @returns {string}
   * @memberof Eclipse
   */
  override defaultAddress(): string {
    return SystemProgram.programId.toBase58();
  }

  /**
   * Logo URL of the native coin.
   * @override
   * @returns {string}
   * @memberof Eclipse
   */
  override logo(): string {
    return "https://pbs.twimg.com/profile_images/1626643141519642625/WLqoO9pu_400x400.jpg";
  }

  /**
   * The display name of the data provider.
   * @override
   * @returns {string}
   * @memberof Eclipse
   */
  override name(): string {
    return "Eclipse";
  }

  /**
   * FIXME:
   * The super implementation relies on Metaplex for NFT and metadata
   * fetching which doesn't exist on Eclipse.
   * @memberof Eclipse
   */
  override getNftsForAddress(
    address: string,
    filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    throw new Error("unimplemented");
  }
}
