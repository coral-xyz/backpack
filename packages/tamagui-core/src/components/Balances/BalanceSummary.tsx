import { formatUSD } from "@coral-xyz/common";
import type { MOBILE_LIGHT_THEME } from "@coral-xyz/themes";
import type { ViewStyleWithPseudos } from "@tamagui/core";
import { XStack, YStack } from "tamagui";

import { useCustomTheme } from "../../hooks";
import { Skeleton } from "../Skeleton";
import { StyledText } from "../StyledText";

export function BalanceSummary({
  percentChange,
  value,
  valueChange,
  style,
}: {
  percentChange: number;
  value: number;
  valueChange: number;
  style?: ViewStyleWithPseudos;
}) {
  return (
    <YStack alignItems="center" justifyContent="center" {...style}>
      <StyledText color="$fontColor" fontSize="$4xl" fontWeight="700">
        {formatUSD(value)}
      </StyledText>
      <XStack alignItems="center" gap={8}>
        <ValueChange value={valueChange} />
        <PercentChange value={percentChange} />
      </XStack>
    </YStack>
  );
}

export function BalanceSummaryLoader() {
  return (
    <YStack
      alignItems="center"
      marginHorizontal={12}
      marginTop={24}
      paddingHorizontal={24}
      gap={12}
    >
      <Skeleton radius={16} height={32} />
      <Skeleton radius={8} height={16} width={165} />
    </YStack>
  );
}

function ValueChange({ value }: { value: number }) {
  const theme = useCustomTheme();
  return (
    <StyledText color={colorByValue(theme, value)}>
      {formatUSD(value)}
    </StyledText>
  );
}

function PercentChange({ value }: { value: number }) {
  return (
    <StyledText
      color="$secondary"
      borderRadius={28}
      lineHeight={24}
      paddingVertical={2}
    >
      ({value > 0 ? "+" : ""}
      {Number.isFinite(value) ? `${value.toFixed(2)}%` : "0.00%"})
    </StyledText>
  );
}

const colorByValue = (theme: typeof MOBILE_LIGHT_THEME, value: number) =>
  value === 0
    ? theme.custom.colors.neutral
    : value < 0
    ? theme.custom.colors.negative
    : theme.custom.colors.positive;