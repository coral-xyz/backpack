import { type TransactionData as TransactionDataType } from "@coral-xyz/recoil";
import { StyledText } from "@coral-xyz/tamagui";
import { formatUnits } from "ethers6";

export function createBalanceChangeItems(tx: TransactionDataType): any {
  return Object.entries(tx.balanceChanges ?? []).map(
    ([symbol, { nativeChange, decimals }]) => {
      const color =
        BigInt(nativeChange.toString()) > 0 ? "$greenText" : "$redText";
      const plus = BigInt(nativeChange.toString()) > 0 ? "+" : "";
      return {
        label: symbol,
        value:
          plus +
          formatUnits(
            BigInt(nativeChange.toString()),
            BigInt(decimals.toLocaleString())
          ),
        valueColor: color,
        valueAfter: (
          <StyledText fontSize="$sm" color={color}>
            {symbol}
          </StyledText>
        ),
      };
    }
  );
}
