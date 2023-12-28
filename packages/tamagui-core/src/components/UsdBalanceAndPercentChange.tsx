import { formatUsd } from "@coral-xyz/common";
import { XStack } from "tamagui";

import { StyledText } from "./StyledText";

// Used in BalanceDetail TokenHeader, slightly diff than other recent percent changes
export function UsdBalanceAndPercentChange({
  usdBalance,
  recentPercentChange,
}: {
  usdBalance: number;
  recentPercentChange: number | undefined;
}): JSX.Element {
  return (
    <XStack ai="center" alignSelf="center" space={8}>
      <UsdBalance usdBalance={usdBalance} />
      <RecentPercentChange recentPercentChange={recentPercentChange} />
    </XStack>
  );
}

function UsdBalance({ usdBalance }: { usdBalance: number }): JSX.Element {
  return (
    <StyledText fontSize="$lg" color="$baseTextMedEmphasis">
      {formatUsd(usdBalance)}
    </StyledText>
  );
}

// Used in BalanceDetail TokenHeader, slightly diff than the other one
function RecentPercentChange({
  recentPercentChange,
}: {
  recentPercentChange: number | undefined;
}): JSX.Element {
  const color =
    recentPercentChange === undefined
      ? "$baseTextMedEmphasis"
      : recentPercentChange > 0
      ? "$greenText"
      : "$redText";

  const formatted = recentPercentChange
    ? `${recentPercentChange.toFixed(2)}%`
    : "%";

  return (
    <StyledText fontSize="$lg" color={color}>
      {formatted}
    </StyledText>
  );
}
