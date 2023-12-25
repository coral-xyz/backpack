import { useCallback, useMemo } from "react";
import {
  formatUsd,
  formatWalletAddress,
  UNKNOWN_ICON_SRC,
} from "@coral-xyz/common";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { DISPLAY_FORMAT } from "../common";

import type { BalanceDetailsProps } from "./BalanceDetails";
import type { ResponseTokenBalance } from "./utils";

const UNCHANGED_VALUE = "0.00";
const NO_VALUE = "-";

export type BalancesTableRowProps = {
  balance: ResponseTokenBalance;
  onClick?: (args: {
    id: string;
    balance: BalanceDetailsProps["balance"];
    displayAmount: string;
    symbol: string;
    token: string;
    tokenAccount: string;
  }) => void;
};

export function BalancesTableRow({ balance, onClick }: BalancesTableRowProps) {
  /**
   * Memoized handler function for the click/press event of the balance table row
   */
  const handleClick = useCallback(
    () =>
      onClick
        ? onClick({
            id: balance.id,
            balance: {
              percentChange: balance.marketData?.percentChange ?? 0,
              value: balance.marketData?.value ?? 0,
              valueChange: balance.marketData?.valueChange ?? 0,
            },
            displayAmount: balance.displayAmount,
            symbol:
              balance.tokenListEntry?.symbol ??
              formatWalletAddress(balance.token),
            token: balance.token,
            tokenAccount: balance.address,
          })
        : {},
    [balance, onClick]
  );

  // Set the memoized change value that should be shown based on view type state
  // for the purpose of checking how the display should appear
  const changeValue = useMemo(() => {
    const val = balance.marketData?.percentChange?.toFixed(2) ?? NO_VALUE;
    return val.endsWith(UNCHANGED_VALUE) && val[0] === "-" ? val.slice(1) : val;
  }, [balance.marketData]);

  // Set the color of the balance change text based on its positive/negative nature
  const changeColor =
    changeValue === UNCHANGED_VALUE || changeValue === NO_VALUE
      ? "$baseTextMedEmphasis"
      : parseFloat(changeValue) < 0
      ? "$redText"
      : "$greenText";

  // Set the change value prefix if required based on its value
  const changePrefix =
    changeColor === "$baseTextMedEmphasis"
      ? ""
      : changeColor === "$greenText"
      ? "+"
      : "";

  // Set the value of the formatted balance change texted
  const changeText =
    changeValue === NO_VALUE ? changeValue : `${changePrefix}${changeValue}%`;

  // Set the name to either the found token list entry name of the truncated mint address
  const name =
    balance.tokenListEntry?.name || formatWalletAddress(balance.token);

  // Set the fully constructed string for the balance value text
  const valueText =
    balance.marketData?.value !== undefined
      ? formatUsd(balance.marketData.value)
      : "-";

  return (
    <ListItemCore
      style={{
        cursor: "pointer",
        hoverTheme: true,
        paddingHorizontal: 16,
        paddingVertical: 12,
        pointerEvents: "box-only",
        backgroundColor: "transparent",
      }}
      onClick={handleClick}
      icon={
        <ListItemIconCore
          radius="$circular"
          image={balance.tokenListEntry?.logo || UNKNOWN_ICON_SRC}
          size={44}
        />
      }
    >
      <YStack display="flex" flex={1}>
        <XStack
          display="flex"
          flex={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText fontSize="$base">{name}</StyledText>
          <StyledText flex={0} fontSize="$base">
            {valueText}
          </StyledText>
        </XStack>
        <XStack
          display="flex"
          flex={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
            {_truncateAmount(balance.displayAmount)}{" "}
            {balance.tokenListEntry?.symbol ?? ""}
          </StyledText>
          <StyledText color={changeColor} flex={0} fontSize="$sm">
            {changeText}
          </StyledText>
        </XStack>
      </YStack>
    </ListItemCore>
  );
}

/**
 * Truncates a argued display amount string to a certain amount of decimal points.
 * @param {string} val
 * @param {number} [decimals=4]
 * @returns {string}
 */
function _truncateAmount(val: string, decimals: number = 4): string {
  try {
    if (!val.includes(".")) return val;
    const num = Number(val);
    return DISPLAY_FORMAT.format(
      Number(num.toFixed(decimals).replace(/\.?0+$/, ""))
    );
  } catch {
    return val;
  }
}
