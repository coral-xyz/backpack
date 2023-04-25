import { Alchemy, BigNumber } from "alchemy-sdk";
import { ethers } from "ethers";

import { ChainId, type TokenBalance, type WalletBalances } from "../types";

import type { Blockchain } from ".";

export class Ethereum implements Blockchain {
  #alchemy: Alchemy;

  constructor() {
    this.#alchemy = new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY });
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {(Promise<WalletBalances | null>)}
   * @memberof Ethereum
   */
  async getBalancesForAddress(address: string): Promise<WalletBalances | null> {
    const native = await this.#alchemy.core.getBalance(address);
    const tokenBalances = await this.#alchemy.core.getTokensForOwner(address);

    const nonEmptyTokens = tokenBalances.tokens.filter(
      (t) => (t.rawBalance ?? "0") !== "0"
    );

    console.log(nonEmptyTokens);

    const tokens: TokenBalance[] = nonEmptyTokens.map((t) => {
      const amt = BigNumber.from(t.rawBalance ?? "0");
      return {
        address,
        amount: amt.toString(),
        decimals: t.decimals ?? 0,
        displayAmount: t.balance ?? "0",
        marketData: null, // FIXME:
        mint: t.contractAddress,
      };
    });

    console.log(tokens);

    return {
      aggregateValue: 0,
      native: {
        address,
        amount: native.toString(),
        decimals: this.nativeDecimals(),
        displayAmount: ethers.utils.formatUnits(native, this.nativeDecimals()),
        marketData: null, // FIXME:
        mint: "",
      },
      tokens: [],
    };
  }

  async getNftsForAddress(address: string): Promise<any> {
    return []; // TODO:
  }

  /**
   * Chain ID enum variant.
   * @returns {ChainId}
   * @memberof Ethereum
   */
  id(): ChainId {
    return ChainId.Ethereum;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Ethereum
   */
  nativeDecimals(): number {
    return 18;
  }
}
