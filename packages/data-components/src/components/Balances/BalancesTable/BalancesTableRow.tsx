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

import type { ResponseTokenBalance } from ".";

const UNCHANGED_VALUE = "0.00";
const NO_VALUE = "-";

export type BalancesTableRowProps = {
  balance: ResponseTokenBalance;
  onClick?: (token: string) => void;
};

export function BalancesTableRow({ balance, onClick }: BalancesTableRowProps) {
  /**
   * Memoized handler function for the click/press event of the balance table row
   */
  const handleClick = useCallback(
    () => (onClick ? onClick(balance.token) : {}),
    [onClick]
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
      ? "$secondary"
      : parseFloat(changeValue) < 0
      ? "$negative"
      : "$positive";

  // Set the change value prefix if required based on its value
  const changePrefix =
    changeColor === "$secondary" ? "" : changeColor === "$positive" ? "+" : "";

  // Set the value of the formatted balance change texted
  const changeText =
    changeValue === NO_VALUE ? changeValue : `${changePrefix}${changeValue}%`;

  // Set the name to either the found token list entry name of the truncated mint address
  const name =
    balance.tokenListEntry?.name ?? formatWalletAddress(balance.token);

  // Set the fully constructed string for the balance value text
  const valueText = balance.marketData?.value
    ? formatUsd(balance.marketData?.value)
    : "-";

  return (
    <ListItemCore
      style={{ paddingHorizontal: 16 }}
      onClick={handleClick}
      icon={
        <ListItemIconCore
          image={balance.tokenListEntry?.logo || UNKNOWN_ICON_SRC}
          radius="$circular"
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
          <StyledText color="$fontColor" fontSize="$base">
            {name}
          </StyledText>
          <StyledText flex={0} color="$fontColor" fontSize="$base">
            {valueText}
          </StyledText>
        </XStack>
        <XStack
          display="flex"
          flex={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText color="$secondary" fontSize="$sm">
            {balance.displayAmount} {balance.tokenListEntry?.symbol ?? ""}
          </StyledText>
          <StyledText color={changeColor} flex={0} fontSize="$sm">
            {changeText}
          </StyledText>
        </XStack>
      </YStack>
    </ListItemCore>
  );
}
