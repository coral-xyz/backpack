import type { CoinGeckoPriceData } from "../clients/coingecko";
import { NodeBuilder } from "../nodes";
import type { MarketData, TokenBalance } from "../types";

/**
 * Consistent construction of a `MarketData` schema node.
 * @export
 * @param {string} displayAmount
 * @param {string} [id]
 * @param {CoinGeckoPriceData} [price]
 * @returns {(MarketData | undefined)}
 */
export function createMarketDataNode(
  displayAmount: string,
  id?: string,
  price?: CoinGeckoPriceData
): MarketData | undefined {
  if (!id || !price) {
    return undefined;
  }
  return NodeBuilder.marketData(id, {
    lastUpdatedAt: price.last_updated,
    percentChange: price.price_change_percentage_24h,
    price: price.current_price,
    sparkline: price.sparkline_in_7d.price,
    usdChange: price.price_change_24h,
    value: parseFloat(displayAmount) * price.current_price,
    valueChange: parseFloat(displayAmount) * price.price_change_24h,
  });
}

/**
 * Sort the argued list of `TokenBalance` nodes by market value decreasing.
 * @export
 * @param {TokenBalance[]} nodes
 * @returns {TokenBalance[]}
 */
export function sortTokenBalanceNodes(nodes: TokenBalance[]): TokenBalance[] {
  return nodes.sort(
    (a, b) => (b.marketData?.value ?? 0) - (a.marketData?.value ?? 0)
  );
}
