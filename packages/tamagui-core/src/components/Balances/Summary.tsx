import { formatUSD } from "@coral-xyz/common";
import type { MOBILE_LIGHT_THEME } from "@coral-xyz/themes";
import { Stack, XStack } from "tamagui";

import { useCustomTheme } from "../../hooks";
import { StyledText } from "../StyledText";

export function BalanceSummary({
  percentChange,
  value,
  valueChange,
}: {
  percentChange: number;
  value: number;
  valueChange: number;
}) {
  return (
    <Stack justifyContent="center" alignItems="center">
      <StyledText fontWeight="700" fontSize="$4xl" color="$fontColor">
        {formatUSD(value)}
      </StyledText>
      <XStack alignItems="center">
        <ValueChange value={valueChange} />
        <PercentChange value={percentChange} />
      </XStack>
    </Stack>
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
      borderRadius={28}
      color="$secondary"
      lineHeight={24}
      paddingHorizontal={8}
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
