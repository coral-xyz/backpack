import { formatUSD, walletAddressDisplay } from "@coral-xyz/common";
import { UNKNOWN_ICON_SRC } from "@coral-xyz/recoil";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { ResponseTokenBalance } from ".";

export type BalancesTableRowProps = {
  balance: ResponseTokenBalance;
};

export function BalancesTableRow({ balance }: BalancesTableRowProps) {
  const name =
    balance.tokenListEntry?.name ?? walletAddressDisplay(balance.token);

  const changeColor = (
    balance.marketData?.percentChange?.toFixed(2) ?? "0.00"
  ).endsWith("0.00")
    ? "$secondary"
    : (balance.marketData?.percentChange ?? 0) < 0
    ? "$negative"
    : "$positive";

  const changePrefix = changeColor !== "$negative" ? "+" : "";
  const percentChangeText = balance.marketData?.percentChange
    ? `${changePrefix}${balance.marketData?.percentChange.toFixed(2)}%`
    : "-";

  const valueText = balance.marketData?.value
    ? formatUSD(balance.marketData?.value)
    : "-";

  return (
    <ListItemCore
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
          <StyledText flex={0} color={changeColor} fontSize="$sm">
            {percentChangeText}
          </StyledText>
        </XStack>
      </YStack>
    </ListItemCore>
  );
}
