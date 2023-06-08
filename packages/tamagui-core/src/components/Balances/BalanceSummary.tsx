import { formatUsd } from "@coral-xyz/common";
import { type ColorTokens, type StackProps, XStack, YStack } from "tamagui";

import { Skeleton } from "../Skeleton";
import { StyledText } from "../StyledText";

export type BalanceSummaryCoreProps = {
  percentChange: number;
  value: number;
  valueChange: number;
  style?: Omit<StackProps, "children">;
};

export function BalanceSummaryCore({
  percentChange,
  value,
  valueChange,
  style,
}: BalanceSummaryCoreProps) {
  return (
    <YStack alignItems="center" justifyContent="center" {...style}>
      <StyledText color="$fontColor" fontSize="$4xl" fontWeight="700">
        {formatUsd(value)}
      </StyledText>
      <XStack alignItems="center" gap={8}>
        <ValueChange value={valueChange} />
        <PercentChange value={percentChange} />
      </XStack>
    </YStack>
  );
}

export function BalanceSummaryCoreLoader() {
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
  return (
    <StyledText color={colorByValue(value)}>{formatUsd(value)}</StyledText>
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

const colorByValue = (value: number): ColorTokens =>
  value === 0 ? "$secondary" : value < 0 ? "$negative" : "$positive";
