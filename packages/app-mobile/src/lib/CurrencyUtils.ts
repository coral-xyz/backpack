import type { BigNumberish, BigNumber } from "ethers";

import { ethers } from "ethers";

/**
 * Hides miniscule amounts of SOL
 * @example approximateAmount(0.00203928) = "0.002"
 * @param value BigNumberish amount of Solana Lamports
 */
export const approximateAmount = (value: BigNumberish) =>
  ethers.utils.formatUnits(value, 9).replace(/(0.0{2,}[1-9])(\d+)/, "$1");

export function formatAmount(
  amount: BigNumber | undefined | null,
  decimals: number | undefined
): string {
  if (amount && decimals) {
    return ethers.utils.formatUnits(amount, decimals);
  } else {
    return "";
  }
}
